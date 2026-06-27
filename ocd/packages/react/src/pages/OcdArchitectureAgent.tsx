import { ChangeEvent, useMemo, useState } from 'react'
import { ConsolePageProps } from '../types/Console'
import { OcdDocument } from '../components/OcdDocument'
import {
    ArchitectureAgentReadiness,
    ArchitectureAgentLlmConfig,
    ArchitecturePlan,
    buildArchitectureAgentReadiness,
    buildArchitectureRelationGraph,
    buildArchitectureTerraformPreview,
    buildArchitectureVisionPrompt,
    buildDesignFromArchitecturePlan,
    callOpenAiCompatibleArchitectureAgent,
    createArchitecturePlanFromPrompt,
    parseArchitecturePlanResponse,
} from '../architecture-agent/OcdArchitectureAgent'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import { OciApiFacade } from '../facade/OciApiFacade'
import { agentPromptTemplates, zeroTrustControls, zeroTrustFlowSteps } from '../security/OcdZeroTrustReference'
import {
    ArchitecturePlannerMode,
    getArchitectureAgentProviderReadiness,
    resolveArchitectureAgentProviderConfig,
} from '../architecture-agent/OcdArchitectureAgentConfig'

const defaultPrompt = agentPromptTemplates[0].prompt

const boundedNumber = (value: string, fallback: number, min: number, max: number): number => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(max, Math.max(min, parsed))
}

const executionResourceKinds = new Set([
    'api_gateway',
    'functions_application',
    'functions_function',
    'dynamic_group',
    'policy',
    'vault',
])

const OcdArchitectureAgent = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const providerConfig = useMemo(() => resolveArchitectureAgentProviderConfig(), [])
    const discoveryPrompt = typeof ocdDocument.design.userDefined.discoveryAgentPrompt === 'string'
        ? ocdDocument.design.userDefined.discoveryAgentPrompt
        : ''
    const [prompt, setPrompt] = useState(discoveryPrompt || defaultPrompt)
    const [plannerMode, setPlannerMode] = useState<ArchitecturePlannerMode>(providerConfig.plannerMode)
    const [endpoint, setEndpoint] = useState(providerConfig.openAiEndpoint)
    const [model, setModel] = useState(providerConfig.openAiModel)
    const [apiKey, setApiKey] = useState('')
    const [ociProfile, setOciProfile] = useState(providerConfig.ociProfile)
    const [ociRegion, setOciRegion] = useState(providerConfig.ociRegion)
    const [ociCompartmentId, setOciCompartmentId] = useState(providerConfig.ociCompartmentId)
    const [ociModelId, setOciModelId] = useState(providerConfig.ociModelId)
    const [temperature, setTemperature] = useState(String(providerConfig.temperature))
    const [maxTokens, setMaxTokens] = useState(String(providerConfig.maxTokens))
    const [plan, setPlan] = useState<ArchitecturePlan>(() => createArchitecturePlanFromPrompt(discoveryPrompt || defaultPrompt))
    const [status, setStatus] = useState(discoveryPrompt ? 'Discovery brief loaded' : 'Local planner ready')
    const [busy, setBusy] = useState(false)
    const [imageDataUri, setImageDataUri] = useState('')
    const [imageFileName, setImageFileName] = useState('')
    const currentProviderConfig = useMemo(() => ({
        ...providerConfig,
        plannerMode,
        openAiEndpoint: endpoint,
        openAiModel: model,
        ociProfile,
        ociRegion,
        ociCompartmentId,
        ociModelId,
    }), [endpoint, model, ociCompartmentId, ociModelId, ociProfile, ociRegion, plannerMode, providerConfig])
    const providerReadiness = useMemo(() => getArchitectureAgentProviderReadiness(currentProviderConfig), [currentProviderConfig])
    const providerLabel = providerReadiness.label
    const planMetrics = useMemo(() => ({
        resources: plan.resources.length,
        execution: plan.resources.filter((resource) => executionResourceKinds.has(resource.kind)).length,
    }), [plan])
    const readiness = useMemo<ArchitectureAgentReadiness>(() => {
        try {
            return buildArchitectureAgentReadiness(plan, buildDesignFromArchitecturePlan(plan))
        } catch (error) {
            return {
                status: 'blocked',
                resourceCount: 0,
                relationCount: 0,
                checks: [{
                    id: 'plan-schema',
                    title: 'Architecture plan schema',
                    status: 'blocked',
                    detail: error instanceof Error ? error.message : 'Architecture plan failed validation.',
                }],
                nextActions: ['Fix blocked readiness checks before applying the generated design.'],
            }
        }
    }, [plan])
    const generatedDesign = useMemo(() => {
        try {
            return buildDesignFromArchitecturePlan(plan)
        } catch {
            return undefined
        }
    }, [plan])
    const relationGraph = useMemo(() => generatedDesign ? buildArchitectureRelationGraph(generatedDesign) : { nodes: [], edges: [] }, [generatedDesign])
    const terraformPreview = useMemo(() => buildArchitectureTerraformPreview(plan), [plan])

    const onImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            setImageDataUri(typeof reader.result === 'string' ? reader.result : '')
            setImageFileName(file.name)
            setStatus(`Diagram attached: ${file.name}`)
        }
        reader.onerror = () => setStatus('Could not read the selected image file.')
        reader.readAsDataURL(file)
    }

    const onClearImage = () => {
        setImageDataUri('')
        setImageFileName('')
    }

    const useVisionPath = plannerMode === 'oci-genai' && imageDataUri !== ''

    const onGenerate = async () => {
        if (!providerReadiness.ready) {
            setStatus(providerReadiness.message)
            return
        }
        setBusy(true)
        setStatus(plannerMode === 'local'
            ? 'Generating local plan'
            : useVisionPath
                ? `Calling ${providerLabel} vision planner`
                : `Calling ${providerLabel} planner`)
        try {
            const modelTemperature = boundedNumber(temperature, providerConfig.temperature, 0, 1)
            const modelMaxTokens = Math.round(boundedNumber(maxTokens, providerConfig.maxTokens, 256, 4000))
            const nextPlan = useVisionPath
                ? parseArchitecturePlanResponse((await OciApiFacade.generateArchitecturePlanFromImageWithGenAi(
                    ociProfile,
                    ociRegion,
                    ociCompartmentId,
                    ociModelId,
                    buildArchitectureVisionPrompt(prompt),
                    imageDataUri,
                    modelTemperature,
                    modelMaxTokens,
                )).text)
                : plannerMode === 'oci-genai'
                ? parseArchitecturePlanResponse((await OciApiFacade.generateArchitecturePlanWithGenAi(
                    ociProfile,
                    ociRegion,
                    ociCompartmentId,
                    ociModelId,
                    prompt,
                    modelTemperature,
                    modelMaxTokens,
                )).text)
                : plannerMode === 'openai'
                    ? await callOpenAiCompatibleArchitectureAgent({
                        endpoint,
                        model,
                        apiKey,
                        temperature: modelTemperature,
                    } as ArchitectureAgentLlmConfig, prompt)
                    : createArchitecturePlanFromPrompt(prompt)
            setPlan(nextPlan)
            setStatus(`${providerLabel} plan ready`)
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Architecture agent failed')
        } finally {
            setBusy(false)
        }
    }

    const onApply = () => {
        if (readiness.status === 'blocked') {
            setStatus(readiness.checks.find((check) => check.status === 'blocked')?.detail ?? 'Architecture plan is blocked.')
            return
        }
        try {
            const clone = OcdDocument.clone(ocdDocument)
            clone.design = buildDesignFromArchitecturePlan(plan)
            clone.autoLayout(clone.getActivePage().id, true, ocdConsoleConfig.config.defaultAutoArrangeStyle ?? 'dynamic-columns')
            setOcdDocument(clone)
            const nextConfig = OcdConsoleConfig.clone(ocdConsoleConfig)
            nextConfig.config.displayPage = 'designer'
            setOcdConsoleConfig(nextConfig)
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Architecture plan failed validation.')
        }
    }

    return (
        <div className='ocd-architecture-agent-page'>
            <header className='ocd-architecture-agent-header'>
                <div className='ocd-agent-title-block'>
                    <span className='ocd-agent-kicker'>Oracle Cloud Infrastructure</span>
                    <h1>Architecture Agent</h1>
                    <p>{status}. Generate editable OCI designs from a chat prompt, with zero-trust controls ready for review.</p>
                </div>
                <button className='ocd-agent-primary' disabled={busy || !providerReadiness.ready} onClick={onGenerate} type='button'>
                    Generate plan
                </button>
            </header>
            <section className='ocd-agent-flow' aria-label='Agentic zero trust flow'>
                {zeroTrustFlowSteps.map((step, index) => (
                    <article className='ocd-agent-flow-step' key={step.title}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h2>{step.title}</h2>
                        <p>{step.summary}</p>
                        <div>
                            {step.controls.map((control) => <b key={control}>{control}</b>)}
                        </div>
                    </article>
                ))}
            </section>
            <div className='ocd-architecture-agent-grid'>
                <section className='ocd-architecture-agent-panel'>
                    <div className='ocd-agent-section-heading'>
                        <h2>Chat</h2>
                        <span>{providerLabel} planner</span>
                    </div>
                    <div className='ocd-agent-template-row' aria-label='Architecture prompt templates'>
                        {agentPromptTemplates.map((template) => (
                            <button
                                key={template.label}
                                onClick={() => setPrompt(template.prompt)}
                                type='button'
                            >
                                {template.label}
                            </button>
                        ))}
                    </div>
                    <textarea
                        aria-label='Architecture request'
                        className='ocd-agent-prompt'
                        onChange={(event) => setPrompt(event.target.value)}
                        value={prompt}
                    />
                    <div className='ocd-agent-provider-grid'>
                        <label>
                            Planner
                            <select
                                aria-label='Architecture planner'
                                onChange={(event) => setPlannerMode(event.target.value as ArchitecturePlannerMode)}
                                value={plannerMode}
                            >
                                <option value='local'>Local deterministic</option>
                                <option value='openai'>OpenAI-compatible</option>
                                <option value='oci-genai'>OCI GenAI</option>
                            </select>
                        </label>
                        {plannerMode === 'openai' ? <>
                            <label>
                                Endpoint
                                <input
                                    aria-label='LLM endpoint'
                                    onChange={(event) => setEndpoint(event.target.value)}
                                    placeholder='https://api.example.com/v1/chat/completions'
                                    type='url'
                                    value={endpoint}
                                />
                            </label>
                            <label>
                                Model
                                <input
                                    aria-label='LLM model'
                                    onChange={(event) => setModel(event.target.value)}
                                    placeholder='model name'
                                    type='text'
                                    value={model}
                                />
                            </label>
                            <label>
                                API Key
                                <input
                                    aria-label='LLM API key'
                                    onChange={(event) => setApiKey(event.target.value)}
                                    placeholder='kept in memory only'
                                    type='password'
                                    value={apiKey}
                                />
                            </label>
                        </> : null}
                        {plannerMode === 'oci-genai' ? <>
                            <label>
                                OCI Profile
                                <input
                                    aria-label='OCI profile'
                                    onChange={(event) => setOciProfile(event.target.value)}
                                    placeholder='DEFAULT'
                                    type='text'
                                    value={ociProfile}
                                />
                            </label>
                            <label>
                                OCI Region
                                <input
                                    aria-label='OCI region'
                                    onChange={(event) => setOciRegion(event.target.value)}
                                    placeholder='eu-frankfurt-1'
                                    type='text'
                                    value={ociRegion}
                                />
                            </label>
                            <label>
                                GenAI Compartment
                                <input
                                    aria-label='OCI GenAI compartment'
                                    onChange={(event) => setOciCompartmentId(event.target.value)}
                                    placeholder='compartment OCID'
                                    type='text'
                                    value={ociCompartmentId}
                                />
                            </label>
                            <label>
                                OCI GenAI Model
                                <input
                                    aria-label='OCI GenAI model'
                                    onChange={(event) => setOciModelId(event.target.value)}
                                    placeholder='cohere.command-a-03-2025'
                                    type='text'
                                    value={ociModelId}
                                />
                            </label>
                            <label>
                                Architecture diagram (optional)
                                <input
                                    accept='image/*'
                                    aria-label='Architecture diagram image'
                                    onChange={onImageSelect}
                                    type='file'
                                />
                            </label>
                            {imageFileName ? (
                                <div className='ocd-agent-image-attachment' role='status'>
                                    <span>Vision input: {imageFileName}</span>
                                    <button onClick={onClearImage} type='button'>Clear image</button>
                                </div>
                            ) : null}
                        </> : null}
                        {plannerMode !== 'local' ? <>
                            <label>
                                Temperature
                                <input
                                    aria-label='Architecture model temperature'
                                    max='1'
                                    min='0'
                                    onChange={(event) => setTemperature(event.target.value)}
                                    step='0.1'
                                    type='number'
                                    value={temperature}
                                />
                            </label>
                            <label>
                                Max Tokens
                                <input
                                    aria-label='Architecture model max tokens'
                                    max='4000'
                                    min='256'
                                    onChange={(event) => setMaxTokens(event.target.value)}
                                    step='128'
                                    type='number'
                                    value={maxTokens}
                                />
                            </label>
                        </> : null}
                    </div>
                    <div className={`ocd-agent-provider-readiness ${providerReadiness.ready ? 'is-ready' : 'needs-config'}`} role='status'>
                        <strong>{providerReadiness.message}</strong>
                        {providerReadiness.issues.length > 0 ? (
                            <div>
                                {providerReadiness.issues.map((issue) => (
                                    <span key={issue.field}>{issue.variable}</span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <div className='ocd-agent-control-panel' aria-label='Zero trust controls'>
                        <h2>Control model</h2>
                        {zeroTrustControls.slice(0, 3).map((control) => (
                            <article key={control.principle}>
                                <h3>{control.principle}</h3>
                                <p>{control.agenticExtension}</p>
                                <div>{control.ociControls.map((item) => <span key={item}>{item}</span>)}</div>
                            </article>
                        ))}
                    </div>
                </section>
                <section className='ocd-architecture-agent-panel'>
                    <div className='ocd-agent-plan-header'>
                        <div>
                            <h2>{plan.title}</h2>
                            <p>{plan.summary}</p>
                        </div>
                        <button className='ocd-agent-apply' onClick={onApply} type='button'>Apply to designer</button>
                    </div>
                    <div className='ocd-agent-plan-metrics' aria-label='Generated plan metrics'>
                        <article>
                            <span>Resources</span>
                            <strong>{planMetrics.resources}</strong>
                        </article>
                        <article>
                            <span>Execution controls</span>
                            <strong>{planMetrics.execution}</strong>
                        </article>
                        <article>
                            <span>Relations</span>
                            <strong>{readiness.relationCount}</strong>
                        </article>
                    </div>
                    <div className='ocd-agent-assumptions'>
                        {readiness.checks.map((check) => (
                            <span key={check.id}>{check.title}: {check.status}</span>
                        ))}
                    </div>
                    <div className='ocd-agent-assumptions'>
                        {plan.assumptions.map((assumption) => <span key={assumption}>{assumption}</span>)}
                    </div>
                    <div className='ocd-agent-terraform-preview' aria-label='Terraform package preview'>
                        <article>
                            <h3>Terraform preview</h3>
                            <strong>{terraformPreview.summary}</strong>
                            <p>{terraformPreview.ready ? 'Ready for Resource Manager plan review.' : 'Fix readiness checks before Resource Manager export.'}</p>
                            <div>
                                {terraformPreview.files.slice(0, 6).map((file) => <span key={file}>{file}</span>)}
                            </div>
                        </article>
                        <article>
                            <h3>Relationship preview</h3>
                            <strong>{relationGraph.edges.length} model relations</strong>
                            <p>{relationGraph.edges[0]?.label ?? 'No model relations are available yet.'}</p>
                        </article>
                    </div>
                    <table className='ocd-agent-resource-table'>
                        <thead>
                            <tr>
                                <th>Resource</th>
                                <th>Type</th>
                                <th>Tier</th>
                                <th>CIDR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plan.resources.map((resource, index) => (
                                <tr key={`${resource.kind}-${resource.displayName}-${index}`}>
                                    <td>{resource.displayName}</td>
                                    <td>{resource.kind}</td>
                                    <td>{resource.tier ?? (resource.public ? 'public' : 'private')}</td>
                                    <td>{resource.cidrBlock ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='ocd-agent-evidence-panel' aria-label='Evidence outputs'>
                        {zeroTrustControls.slice(3).map((control) => (
                            <article key={control.principle}>
                                <h3>{control.principle}</h3>
                                <ul>
                                    {control.evidence.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default OcdArchitectureAgent
