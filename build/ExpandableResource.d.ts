/// <reference types="node" />
export interface ExpandableResource {
    position: number;
    write(input: Buffer | any[] | string | number): Promise<number>;
}
