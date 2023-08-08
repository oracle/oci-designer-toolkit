/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { QueryDialogProps } from "../../types/Dialogs"

export const OcdQueryDialog = ({ocdDocument, setOcdDocument}: QueryDialogProps): JSX.Element => {
    const className = `ocd-query-dialog`
    return (
        <div className={className}>
            <div>
                <div className='ocd-dialog-title'>Query</div>
                <div className='ocd-dialog-body'>
                    <div>
                        <div>Profile</div><div></div>
                        <div>Region</div><div></div>
                        <div>Compartments</div><div></div>
                    </div>
                </div>
                <div className='ocd-dialog-footer'>
                    <div>
                        <div><button>Cancel</button></div>
                        <div><button>Query</button></div>
                    </div>
                </div>
            </div>
        </div>
    )
}