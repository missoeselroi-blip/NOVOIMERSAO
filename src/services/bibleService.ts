import axios from 'axios';

const fetchWithFallback = async (path: string) => {
  // Clean path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  const endpoints = [
    `/api/bible/${cleanPath}`,
    `https://bolls.life/${cleanPath}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://bolls.life/${cleanPath}`)}`
  ];
  
  for (const url of endpoints) {
    try {
      const response = await axios.get(url, { timeout: 15000 });
      // Check if response is valid JSON and not HTML (which happens on static hosting 404s)
      if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
        console.warn(`[BibleService] Endpoint ${url} returned HTML, skipping...`);
        continue;
      }
      return response;
    } catch (e) {
      console.warn(`[BibleService] Endpoint ${url} failed`);
      continue;
    }
  }
  throw new Error("All endpoints failed");
};

export interface BibleVersion {
  id: number;
  name: string;
  short_name: string;
  language: string;
}

export interface BibleBook {
  pk: number;
  name: string;
  chapters: number;
}

export interface BibleVerse {
  pk: number;
  verse: number;
  text: string;
}

export interface SearchResult {
  pk: number;
  verse: number;
  text: string;
  book: string;
  chapter: number;
}

export const bibleService = {
  getVersions: async (): Promise<BibleVersion[]> => {
    try {
      // Try multiple possible endpoints for translations
      const endpoints = [
        `get-translations/`,
        `get-translations`,
        `translations/`,
        `translations`,
        `api/get-translations/`,
        `api/v1/get-translations/`
      ];
      
      for (const path of endpoints) {
        try {
          const response = await fetchWithFallback(path);
          if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data.map((v: any, index: number) => ({
              id: v.id || v.pk || (index + 1),
              name: v.name || v.title || `Versão ${index + 1}`,
              short_name: v.short_name || v.abbreviation || v.id || `V${index + 1}`,
              language: v.language || "Unknown"
            }));
          }
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            const values = Object.values(response.data).flat() as any[];
            if (values.length > 0) {
              return values.map((v: any, index: number) => ({
                id: v.id || v.pk || (index + 1),
                name: v.name || v.title || `Versão ${index + 1}`,
                short_name: v.short_name || v.abbreviation || v.id || `V${index + 1}`,
                language: v.language || "Unknown"
              }));
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch translations from ${path}`);
        }
      }
      
      // Fallback to common versions if API fails
      return [
        { id: 1, name: "Almeida Revista e Atualizada", short_name: "ARA", language: "Português" },
        { id: 2, name: "Nova Versão Internacional", short_name: "NVI", language: "Português" },
        { id: 5, name: "Nova Tradução na Linguagem de Hoje", short_name: "NTLH", language: "Português" },
        { id: 6, name: "Bíblia Viva", short_name: "BV", language: "Português" },
        { id: 10, name: "Almeida Revista e Corrigida", short_name: "ARC", language: "Português" },
        { id: 14, name: "King James Atualizada", short_name: "KJA", language: "Português" },
        { id: 11, name: "Almeida Corrigida Fiel", short_name: "ACF", language: "Português" },
        { id: 8, name: "King James Version (Inglês)", short_name: "KJV", language: "Inglês" }
      ];
    } catch (error) {
      console.error('Error fetching Bible versions:', error);
      return [];
    }
  },

  shortenBookName: (name: string): string => {
    const longNames: { [key: string]: string } = {
      "O Primeiro livro de Moisés chamado Gênesis": "Gênesis",
      "O Segundo livro de Moisés chamado Êxodo": "Êxodo",
      "O Terceiro livro de Moisés chamado Levítico": "Levítico",
      "O Quarto livro de Moisés chamado Números": "Números",
      "O Quinto livro de Moisés chamado Deuteronômio": "Deuteronômio",
      "O Livro de Josué": "Josué",
      "O Livro dos Juízes": "Juízes",
      "O Livro de Rute": "Rute",
      "O Primeiro livro de Samuel": "1 Samuel",
      "O Segundo livro de Samuel": "2 Samuel",
      "O Primeiro livro dos Reis": "1 Reis",
      "O Segundo livro dos Reis": "2 Reis",
      "O Primeiro livro das Crônicas": "1 Crônicas",
      "O Segundo livro das Crônicas": "2 Crônicas",
      "O Livro de Esdras": "Esdras",
      "O Livro de Neemias": "Neemias",
      "O Livro de Ester": "Ester",
      "O Livro de Jó": "Jó",
      "O Livro dos Salmos": "Salmos",
      "Os Provérbios": "Provérbios",
      "O Livro do Eclesiastes": "Eclesiastes",
      "O Cântico dos Cânticos de Salomão": "Cânticos",
      "O Livro do profeta Isaías": "Isaías",
      "O Livro do profeta Jeremias": "Jeremias",
      "As Lamentações de Jeremias": "Lamentações",
      "O Livro do profeta Ezequiel": "Ezequiel",
      "O Livro do profeta Daniel": "Daniel",
      "O Livro de Oseias": "Oseias",
      "O Livro de Joel": "Joel",
      "O Livro de Amós": "Amós",
      "O Livro de Obadias": "Obadias",
      "O Livro de Jonas": "Jonas",
      "O Livro de Miqueias": "Miqueias",
      "O Livro de Naum": "Naum",
      "O Livro de Habacuque": "Habacuque",
      "O Livro de Sofonias": "Sofonias",
      "O Livro de Ageu": "Ageu",
      "O Livro de Zacarias": "Zacarias",
      "O Livro de Malaquias": "Malaquias",
      "O Evangelho segundo Mateus": "Mateus",
      "O Evangelho segundo Marcos": "Marcos",
      "O Evangelho segundo Lucas": "Lucas",
      "O Evangelho segundo João": "João",
      "Os Atos dos Apóstolos": "Atos",
      "A Epístola de Paulo aos Romanos": "Romanos",
      "A Primeira Epístola de Paulo aos Coríntios": "1 Coríntios",
      "A Segunda Epístola de Paulo aos Coríntios": "2 Coríntios",
      "A Epístola de Paulo aos Gálatas": "Gálatas",
      "A Epístola de Paulo aos Efésios": "Efésios",
      "A Epístola de Paulo aos Filipenses": "Filipenses",
      "A Epístola de Paulo aos Colossenses": "Colossenses",
      "A Primeira Epístola de Paulo aos Tessalonicenses": "1 Tessalonicenses",
      "A Segunda Epístola de Paulo aos Tessalonicenses": "2 Tessalonicenses",
      "A Primeira Epístola de Paulo a Timóteo": "1 Timóteo",
      "A Segunda Epístola de Paulo a Timóteo": "2 Timóteo",
      "A Epístola de Paulo a Tito": "Tito",
      "A Epístola de Paulo a Filemom": "Filemom",
      "A Epístola aos Hebreus": "Hebreus",
      "A Epístola de Tiago": "Tiago",
      "A Primeira Epístola de Pedro": "1 Pedro",
      "A Segunda Epístola de Pedro": "2 Pedro",
      "A Primeira Epístola de João": "1 João",
      "A Segunda Epístola de João": "2 João",
      "A Terceira Epístola de João": "3 João",
      "A Epístola de Judas": "Judas",
      "O Apocalipse de João": "Apocalipse"
    };

    return longNames[name] || name;
  },

  getBookAbbreviation: (name: string): string => {
    const abbreviations: { [key: string]: string } = {
      "Gênesis": "Gn",
      "Êxodo": "Ex",
      "Levítico": "Lv",
      "Números": "Nm",
      "Deuteronômio": "Dt",
      "Josué": "Js",
      "Juízes": "Jz",
      "Rute": "Rt",
      "1 Samuel": "1Sm",
      "2 Samuel": "2Sm",
      "1 Reis": "1Rs",
      "2 Reis": "2Rs",
      "1 Crônicas": "1Cr",
      "2 Crônicas": "2Cr",
      "Esdras": "Ed",
      "Neemias": "Ne",
      "Ester": "Et",
      "Jó": "Jó",
      "Salmos": "Sl",
      "Provérbios": "Pv",
      "Eclesiastes": "Ec",
      "Cânticos": "Ct",
      "Isaías": "Is",
      "Jeremias": "Jr",
      "Lamentações": "Lm",
      "Ezequiel": "Ez",
      "Daniel": "Dn",
      "Oseias": "Os",
      "Joel": "Jl",
      "Amós": "Am",
      "Obadias": "Ob",
      "Jonas": "Jn",
      "Miqueias": "Mq",
      "Naum": "Na",
      "Habacuque": "Hc",
      "Sofonias": "Sf",
      "Ageu": "Ag",
      "Zacarias": "Zc",
      "Malaquias": "Ml",
      "Mateus": "Mt",
      "Marcos": "Mc",
      "Lucas": "Lc",
      "João": "Jo",
      "Atos": "At",
      "Romanos": "Rm",
      "1 Coríntios": "1Co",
      "2 Coríntios": "2Co",
      "Gálatas": "Gl",
      "Efésios": "Ef",
      "Filipenses": "Fp",
      "Colossenses": "Cl",
      "1 Tessalonicenses": "1Ts",
      "2 Tessalonicenses": "2Ts",
      "1 Timóteo": "1Tm",
      "2 Timóteo": "2Tm",
      "Tito": "Tt",
      "Filemom": "Fm",
      "Hebreus": "Hb",
      "Tiago": "Tg",
      "1 Pedro": "1Pe",
      "2 Pedro": "2Pe",
      "1 João": "1Jo",
      "2 João": "2Jo",
      "3 João": "3Jo",
      "Judas": "Jd",
      "Apocalipse": "Ap"
    };
    
    // First shorten the name if it's long, then look up abbreviation
    const shortName = bibleService.shortenBookName(name);
    return abbreviations[shortName] || shortName.substring(0, 3);
  },

  getBooks: async (version: string): Promise<BibleBook[]> => {
    try {
      const response = await fetchWithFallback(`get-books/${version}/`);
      if (Array.isArray(response.data)) {
        return response.data.map((b: any, index: number) => ({
          pk: b.pk || b.id || (index + 1),
          name: bibleService.shortenBookName(b.name || b.title || `Livro ${index + 1}`),
          chapters: b.chapters || b.chapter_count || 0
        }));
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.warn(`Failed to fetch books for ${version}, using fallback`);
      // Fallback books list for common versions
      return [
        { pk: 1, name: "Gênesis", chapters: 50 },
        { pk: 2, name: "Êxodo", chapters: 40 },
        { pk: 3, name: "Levítico", chapters: 27 },
        { pk: 4, name: "Números", chapters: 36 },
        { pk: 5, name: "Deuteronômio", chapters: 34 },
        { pk: 6, name: "Josué", chapters: 24 },
        { pk: 7, name: "Juízes", chapters: 21 },
        { pk: 8, name: "Rute", chapters: 4 },
        { pk: 9, name: "1 Samuel", chapters: 31 },
        { pk: 10, name: "2 Samuel", chapters: 24 },
        { pk: 11, name: "1 Reis", chapters: 22 },
        { pk: 12, name: "2 Reis", chapters: 25 },
        { pk: 13, name: "1 Crônicas", chapters: 29 },
        { pk: 14, name: "2 Crônicas", chapters: 36 },
        { pk: 15, name: "Esdras", chapters: 10 },
        { pk: 16, name: "Neemias", chapters: 13 },
        { pk: 17, name: "Ester", chapters: 10 },
        { pk: 18, name: "Jó", chapters: 42 },
        { pk: 19, name: "Salmos", chapters: 150 },
        { pk: 20, name: "Provérbios", chapters: 31 },
        { pk: 21, name: "Eclesiastes", chapters: 12 },
        { pk: 22, name: "Cânticos", chapters: 8 },
        { pk: 23, name: "Isaías", chapters: 66 },
        { pk: 24, name: "Jeremias", chapters: 52 },
        { pk: 25, name: "Lamentações", chapters: 5 },
        { pk: 26, name: "Ezequiel", chapters: 48 },
        { pk: 27, name: "Daniel", chapters: 12 },
        { pk: 28, name: "Oseias", chapters: 14 },
        { pk: 29, name: "Joel", chapters: 3 },
        { pk: 30, name: "Amós", chapters: 9 },
        { pk: 31, name: "Obadias", chapters: 1 },
        { pk: 32, name: "Jonas", chapters: 4 },
        { pk: 33, name: "Miqueias", chapters: 7 },
        { pk: 34, name: "Naum", chapters: 3 },
        { pk: 35, name: "Habacuque", chapters: 3 },
        { pk: 36, name: "Sofonias", chapters: 3 },
        { pk: 37, name: "Ageu", chapters: 2 },
        { pk: 38, name: "Zacarias", chapters: 14 },
        { pk: 39, name: "Malaquias", chapters: 4 },
        { pk: 40, name: "Mateus", chapters: 28 },
        { pk: 41, name: "Marcos", chapters: 16 },
        { pk: 42, name: "Lucas", chapters: 24 },
        { pk: 43, name: "João", chapters: 21 },
        { pk: 44, name: "Atos", chapters: 28 },
        { pk: 45, name: "Romanos", chapters: 16 },
        { pk: 46, name: "1 Coríntios", chapters: 16 },
        { pk: 47, name: "2 Coríntios", chapters: 13 },
        { pk: 48, name: "Gálatas", chapters: 6 },
        { pk: 49, name: "Efésios", chapters: 6 },
        { pk: 50, name: "Filipenses", chapters: 4 },
        { pk: 51, name: "Colossenses", chapters: 4 },
        { pk: 52, name: "1 Tessalonicenses", chapters: 5 },
        { pk: 53, name: "2 Tessalonicenses", chapters: 3 },
        { pk: 54, name: "1 Timóteo", chapters: 6 },
        { pk: 55, name: "2 Timóteo", chapters: 4 },
        { pk: 56, name: "Tito", chapters: 3 },
        { pk: 57, name: "Filemom", chapters: 1 },
        { pk: 58, name: "Hebreus", chapters: 13 },
        { pk: 59, name: "Tiago", chapters: 5 },
        { pk: 60, name: "1 Pedro", chapters: 5 },
        { pk: 61, name: "2 Pedro", chapters: 3 },
        { pk: 62, name: "1 João", chapters: 5 },
        { pk: 63, name: "2 João", chapters: 1 },
        { pk: 64, name: "3 João", chapters: 1 },
        { pk: 65, name: "Judas", chapters: 1 },
        { pk: 66, name: "Apocalipse", chapters: 22 }
      ];
    }
  },

  getChapter: async (version: string, bookId: number, chapter: number): Promise<BibleVerse[]> => {
    try {
      const response = await fetchWithFallback(`get-chapter/${version}/${bookId}/${chapter}/`);
      if (Array.isArray(response.data)) {
        return response.data.map((v: any, index: number) => ({
          pk: v.pk || v.id || (index + 1),
          verse: v.verse || v.number || (index + 1),
          text: v.text || v.content || ""
        }));
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.warn(`Failed to fetch chapter ${chapter} of book ${bookId} for ${version}`);
      return [
        { pk: 1, verse: 1, text: "Não foi possível carregar o texto bíblico. Verifique sua conexão ou tente novamente mais tarde." }
      ];
    }
  },

  getVerse: async (version: string, bookId: number, chapter: number, verse: number): Promise<BibleVerse> => {
    try {
      const response = await fetchWithFallback(`get-verse/${version}/${bookId}/${chapter}/${verse}/`);
      const v = response.data;
      if (v && typeof v === 'object') {
        return {
          pk: v.pk || v.id || 0,
          verse: v.verse || v.number || verse,
          text: v.text || v.content || ""
        };
      }
      throw new Error("Invalid response format");
    } catch (error) {
      return { pk: 0, verse, text: "Versículo indisponível" };
    }
  },

  search: async (version: string, query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetchWithFallback(`search/${version}/?search=${encodeURIComponent(query)}`);
      if (Array.isArray(response.data)) {
        return response.data.map((res: any, index: number) => ({
          pk: res.pk || res.id || (index + 1),
          verse: res.verse || res.number || 0,
          text: res.text || res.content || "",
          book: res.book || res.book_name || "",
          chapter: res.chapter || res.chapter_number || 0
        }));
      }
      return [];
    } catch (error) {
      console.warn(`Search failed for query: ${query}`);
      return [];
    }
  }
};
