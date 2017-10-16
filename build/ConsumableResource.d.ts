/// <reference types="node" />
export interface ConsumableResource {
    reset(): Promise<void>;
    read(bytes: number): Promise<Buffer>;
    seek(bytes: number): Promise<void>;
    aseek(bytes: number): Promise<void>;
}
