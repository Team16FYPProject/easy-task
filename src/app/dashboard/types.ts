// Data Table row data
export type TeamViewData = [string, string] | undefined;

// Interface for Data Table rows
export interface RowData {
    id: number;
    teamView1: TeamViewData;
    teamView2: TeamViewData;
    teamView3: TeamViewData;
}
