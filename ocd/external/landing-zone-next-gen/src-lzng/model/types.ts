/**
 * Canonical Landing Zone model — the single source of truth.
 *
 * The wizard writes into this object; every downstream view (JSON preview,
 * on-screen diagram, .drawio export, SVG export) is a PURE derivation of it.
 * Each new wizard step adds fields here and the diagram grows to match.
 *
 * Milestone 0 is deliberately tiny: a tenancy and a hub VCN. That's enough to
 * exercise the whole pipeline (two nodes + one edge → live diagram → drawio).
 */

export interface FoundationConfig {
  realm: string;           // e.g. oc1
  region: string;          // region identifier, e.g. eu-frankfurt-1
  regionShortName: string; // three-letter region key, e.g. fra
}

/** Per-environment spoke network — seeded with defaults, user-adjustable in step 2. */
export interface EnvNetworkConfig {
  vcnCidr: string;
  subnets: Subnet[];
  /** Routing names (diagram-only): VCN→DRG attachment + the VCN's Service Gateway. */
  routing: VcnRouting;
}

/**
 * Routing labels for one VCN — diagram-only (like presentation, excluded from
 * the generated config). The attachment name resolves <region>/<lze>/<env>
 * tokens; gateway names are free text and default to their OCI type label.
 */
export interface VcnRouting {
  /** Name of this VCN's attachment to the DRG, e.g. vcn-prod-attach. */
  attachmentName: string;
  /** Service Gateway display name (every VCN has one). */
  sgwName: string;
  /** Internet / NAT Gateway names — hub VCN only; undefined on spokes. */
  igwName?: string;
  natName?: string;
}

export interface Environment {
  name: string;            // e.g. prod
  securityZone: boolean;   // enrol this environment in an OCI Security Zone
  network: EnvNetworkConfig;
}

/**
 * A project — an (initially empty) compartment dropped inside one or more
 * environments. `environments: 'all'` applies it to every environment
 * dynamically; otherwise it lists the specific environment names.
 */
export interface ProjectConfig {
  name: string;
  environments: 'all' | string[];
}

export type HubKind = 'hub_a' | 'hub_b' | 'hub_c' | 'hub_d' | 'hub_e';

export interface Subnet {
  name: string;
  cidr: string;
}

export interface NetworkConfig {
  hubKind: HubKind;
  /** May contain <region> / <lze> tokens, resolved from foundation + presentation. */
  hubVcnName: string;
  hubVcnCidr: string;
  subnets: Subnet[];
  /** Firewall instance IPs (diagram-only). Empty → derived from the fw subnet range. */
  fwDmzIp: string;
  fwIntIp: string;
  /** Name of the single DRG in the network compartment (diagram-only). */
  drgName: string;
  /** Hub VCN routing: attachment + IGW/NAT/SGW names (diagram-only). */
  routing: VcnRouting;
}

/**
 * Diagram-only labels. These name containers in the network diagram but are
 * intentionally NOT part of the generated config (serializeConfig ignores them).
 */
export interface PresentationConfig {
  customer: string;       // names the OCI Tenancy / Operating Entity container
  landingZone: string;    // names the landing zone compartment container
}

export interface LzModel {
  /** Schema version of this canonical object. */
  version: string;
  foundation: FoundationConfig;
  environments: Environment[];
  network: NetworkConfig;
  /** Projects dropped into environments (step 3). */
  projects: ProjectConfig[];
  presentation: PresentationConfig;
}

/**
 * Renderer-agnostic diagram intermediate. `buildGraph(model)` produces this;
 * the React Flow renderer and the drawio/SVG exporters both consume it, so the
 * on-screen diagram and the exported file always agree without sharing an
 * engine.
 */
export interface DiagramNode {
  id: string;
  /** Semantic kind — drives styling in each renderer. */
  kind: 'region' | 'tenancy' | 'landingzone' | 'compartment' | 'vcn' | 'subnet' | 'gateway' | 'drg' | 'attachment' | 'routetable' | 'rtdot' | 'project';
  label: string;
  /** Compartment fill: yellow (shared), green (environment) or gray (projects). */
  tone?: 'yellow' | 'green' | 'gray';
  /** Environment compartment enrolled in an OCI Security Zone (shows a shield). */
  secure?: boolean;
  /** Compartment that holds nested children — label renders top-left. */
  container?: boolean;
  /** Icon glyph: gateways use it as the node body, subnets show it centred. */
  icon?: 'igw' | 'natgw' | 'sgw' | 'firewall' | 'lb';
  /** Caption under a subnet icon (e.g. nfw-<region>-hub-dmz). */
  caption?: string;
  /** Caption colour. */
  captionTone?: 'green' | 'orange';
  /** Extra line under the caption — e.g. a firewall instance IP address. */
  ipNote?: string;
  /** Endpoint (VM) shown inside an icon-less subnet when the endpoints layer is on. */
  endpointName?: string;
  endpointIp?: string;
  /** Public subnet (IGW-routed) — e.g. the hub LB / DMZ-firewall subnets. */
  publicSubnet?: boolean;
  /** Route-table box payload (kind === 'routetable'). */
  rtRows?: { destination: string; targetType: string; target: string; routeType: string }[];
  rtColumns?: 'vcn' | 'drg';
  rtNote?: string;
  rtTone?: 'hub' | 'gateway' | 'drg' | 'spoke';
  /** Rows (by index) to highlight when a flow traverses this table. */
  rtHighlight?: number[];
  /** Route-table dot (kind === 'rtdot'): the table it opens, its state, its colour. */
  rtDotTableId?: string;
  rtDotOpen?: boolean;
  rtDotConfigured?: boolean;
  rtDotTone?: 'hub' | 'gateway' | 'drg' | 'spoke';
  /** Container nesting — id of the parent node; x/y are then relative to it. */
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EdgeSide = 'left' | 'right' | 'top' | 'bottom';

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  /** When true, renderers show a moving/packet-flow animation on the edge. */
  animated?: boolean;
  /** Per-flow stroke colour (set on flow-trace edges; absent on structural links). */
  color?: string;
  /** Flow overlay: ordered node ids the packet visits (used by the .drawio export
   * + auto-fit). The on-screen path uses the precomputed `points` below. */
  waypoints?: string[];
  /** Flow overlay: absolute centre of each waypoint, precomputed by buildGraph so
   * the overlay never reads (and lags behind) the live node positions. */
  points?: { x: number; y: number }[];
  /** Flow overlay: numbered hop badges with their precomputed absolute centres. */
  badges?: { node: string; seq: number; x: number; y: number }[];
  /** Fixed connection sides — pins endpoints to a specific border for clean routing. */
  sourceSide?: EdgeSide;
  targetSide?: EdgeSide;
  /** Horizontal nudge (px) for the orthogonal mid-bend, so parallel links don't overlap. */
  channel?: number;
  /**
   * Absolute x (canvas coords) to pin the orthogonal vertical bend to — used to
   * hold a link's vertical run in a fixed channel (e.g. the gutter) regardless of
   * how the boxes either side resize. `channel` still applies as a stagger on top.
   */
  centerX?: number;
}

export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

/** Toggle layers on the diagram (route-table dots/boxes, endpoints, a flow). */
export interface DiagramOptions {
  /** Show the route-table dots (click a dot to open its table). */
  showDots?: boolean;
  /** Ids of the route tables currently opened on the diagram. */
  openTables?: string[];
  showEndpoints?: boolean;
  /** Show the docked flow picker (right-side sidebar). */
  showFlows?: boolean;
  /** Selected flow ids — composite `<env>:<flowKind>` (e.g. "prod:egress"). */
  activeFlows?: string[];
}
