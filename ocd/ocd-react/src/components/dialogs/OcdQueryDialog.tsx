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
                <div className='ocd-dialog-title'>Query Header</div>
                <div className='ocd-dialog-body'>Query</div>
                <div className='ocd-dialog-footer'>Query Footer</div>
            </div>
        </div>
    )
}