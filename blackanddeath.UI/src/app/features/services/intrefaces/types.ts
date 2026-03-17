export interface IStorageChangeEvent {
    action: IStorageChangeActionsType;
    modified?: boolean;
    key?: KeyType;
    value?: any;
}

export type IStorageChangeActionsType = 'get' | 'set' | 'clear' | 'remove';


export interface IStorageActionOptions {
    emit: boolean;
}