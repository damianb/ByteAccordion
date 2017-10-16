/// <reference types="node" />
export interface ExpandingResource {
    position: number;
    write(input: Buffer | any[] | string | number): Promise<number>;
}
