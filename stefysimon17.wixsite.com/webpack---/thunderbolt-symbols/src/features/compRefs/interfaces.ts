import type { CompRef, CompRefPromise } from './types'

export type AddCompRefById = (compId: string, compRef: CompRef) => void
export type GetCompRefById = (compId: string) => CompRefPromise
export type CompRefAPI = {
	getCompRefById: GetCompRefById
}

export const CompRefAPISym = Symbol.for('GetCompRefById')
