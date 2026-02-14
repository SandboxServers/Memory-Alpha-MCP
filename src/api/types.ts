export interface SearchResult {
  ns: number;
  title: string;
  pageid: number;
  snippet: string;
  size: number;
  wordcount: number;
}

export interface SearchResponse {
  query: {
    search: SearchResult[];
    searchinfo?: { totalhits: number };
  };
}

export interface ParseResponse {
  parse: {
    title: string;
    pageid: number;
    wikitext?: { '*': string };
  };
}

export interface CategoryMember {
  pageid: number;
  ns: number;
  title: string;
}

export interface CategoryMembersResponse {
  query: {
    categorymembers: CategoryMember[];
  };
  continue?: {
    cmcontinue: string;
  };
}

export interface RandomPage {
  id: number;
  ns: number;
  title: string;
}

export interface RandomResponse {
  query: {
    random: RandomPage[];
  };
}
