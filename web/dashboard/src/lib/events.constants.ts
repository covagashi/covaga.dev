// Static catalog for the 19 ECAD events: human label, the client action
// script that emits each one, and the group it belongs to in the UI.
// TODO(oma-deferred): map `script` to the real action names in the
// eplan-byndr client repo (scripts/actions/*.cs) once both repos link up.

import type { EventId } from "./api";

export type EventGroupId = "export" | "project" | "masterdata" | "plc";

export const EVENT_GROUPS: { id: EventGroupId; label: string }[] = [
  { id: "export", label: "Export" },
  { id: "project", label: "Project" },
  { id: "masterdata", label: "Master data" },
  { id: "plc", label: "PLC" },
];

export interface EventMeta {
  label: string;
  script: string;
  group: EventGroupId;
}

export const EVENT_CATALOG: Record<EventId, EventMeta> = {
  "pdf-exported": { label: "PDF exported", script: "ExportPdf.cs", group: "export" },
  "bom-exported": { label: "BOM exported", script: "ExportBom.cs", group: "export" },
  "dxf-dwg-exported": { label: "DXF/DWG exported", script: "ExportDxfDwg.cs", group: "export" },
  "wiring-exported": { label: "Wiring exported", script: "ExportWiring.cs", group: "export" },
  "labeling-exported": { label: "Labeling exported", script: "ExportLabeling.cs", group: "export" },
  "productiondata-exported": { label: "Production data exported", script: "ExportProductionData.cs", group: "export" },
  "dc-common-exported": { label: "DC common exported", script: "ExportDcCommon.cs", group: "export" },
  "project-closed": { label: "Project closed", script: "OnProjectClose.cs", group: "project" },
  "project-backed-up": { label: "Project backed up", script: "BackupProject.cs", group: "project" },
  "project-restored": { label: "Project restored", script: "RestoreProject.cs", group: "project" },
  "project-synchronized": { label: "Project synchronized", script: "SyncProject.cs", group: "project" },
  "project-translated": { label: "Project translated", script: "TranslateProject.cs", group: "project" },
  "reports-updated": { label: "Reports updated", script: "UpdateReports.cs", group: "project" },
  "masterdata-backed-up": { label: "Master data backed up", script: "BackupMasterdata.cs", group: "masterdata" },
  "masterdata-restored": { label: "Master data restored", script: "RestoreMasterdata.cs", group: "masterdata" },
  "plc-busdata-exported": { label: "PLC bus data exported", script: "ExportPlcBusdata.cs", group: "plc" },
  "plc-busdata-imported": { label: "PLC bus data imported", script: "ImportPlcBusdata.cs", group: "plc" },
  "plc-schematic-generated": { label: "PLC schematic generated", script: "GeneratePlcSchematic.cs", group: "plc" },
  "plc-addressoverview-exported": { label: "PLC address overview exported", script: "ExportPlcAddressOverview.cs", group: "plc" },
};
