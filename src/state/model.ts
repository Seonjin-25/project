import { type Candidate, type SiteRecord } from '../lib/data';
import { changeFilters, DEFAULT_FILTERS, type Filters } from '../lib/domain';
export type AppState={ records: SiteRecord[]; filters:Filters; dataVersion:number; scopeVersion:number; notice:string };
export const INITIAL_STATE:AppState={records:[],filters:{...DEFAULT_FILTERS},dataVersion:0,scopeVersion:0,notice:''};
export type Action={type:'replace'; candidate:Candidate}|{type:'filter';patch:Partial<Filters>}|{type:'reset'};
export function reducer(state:AppState,action:Action):AppState {
  if(action.type==='replace') {
    if(action.candidate.errors.length || !action.candidate.records.length) return state;
    return {records:action.candidate.records,filters:{...DEFAULT_FILTERS},dataVersion:state.dataVersion+1,scopeVersion:state.scopeVersion+1,notice:`${action.candidate.records.length}행 자료로 전체 교체했습니다.`};
  }
  return {...state, filters: action.type==='reset' ? {...DEFAULT_FILTERS} : changeFilters(state.records,state.filters,action.patch),scopeVersion:state.scopeVersion+1,notice:''};
}
