declare module '@tryghost/content-api' {
  interface GhostContentAPIOptions {
    url: string;
    key: string;
    version: string;
  }

  interface GhostAuthor {
    id: string;
    name: string;
    slug: string;
    profile_image?: string | null;
    bio?: string | null;
    website?: string | null;
    twitter?: string | null;
    facebook?: string | null;
  }

  interface GhostTag {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    feature_image?: string | null;
    visibility: string;
  }

  interface GhostPost {
    id: string;
    uuid: string;
    title: string;
    slug: string;
    html?: string | null;
    plaintext?: string | null;
    feature_image?: string | null;
    featured: boolean;
    excerpt?: string | null;
    custom_excerpt?: string | null;
    published_at?: string | null;
    created_at: string;
    updated_at?: string | null;
    tags?: GhostTag[];
    authors?: GhostAuthor[];
    primary_author?: GhostAuthor;
    primary_tag?: GhostTag;
    url: string;
    reading_time?: number;
  }

  interface GhostPage {
    id: string;
    uuid: string;
    title: string;
    slug: string;
    html?: string | null;
    plaintext?: string | null;
    feature_image?: string | null;
    featured: boolean;
    excerpt?: string | null;
    published_at?: string | null;
    created_at: string;
    updated_at?: string | null;
    url: string;
  }

  interface BrowseOptions {
    limit?: number | 'all';
    page?: number;
    filter?: string;
    include?: string;
    fields?: string;
    formats?: string;
    order?: string;
  }

  interface ReadOptions {
    id?: string;
    slug?: string;
    include?: string;
    fields?: string;
    formats?: string;
  }

  class GhostContentAPI {
    constructor(options: GhostContentAPIOptions);

    posts: {
      browse(options?: BrowseOptions): Promise<GhostPost[]>;
      read(options: ReadOptions): Promise<GhostPost>;
    };

    pages: {
      browse(options?: BrowseOptions): Promise<GhostPage[]>;
      read(options: ReadOptions): Promise<GhostPage>;
    };

    authors: {
      browse(options?: BrowseOptions): Promise<GhostAuthor[]>;
      read(options: ReadOptions): Promise<GhostAuthor>;
    };

    tags: {
      browse(options?: BrowseOptions): Promise<GhostTag[]>;
      read(options: ReadOptions): Promise<GhostTag>;
    };
  }

  export default GhostContentAPI;
}
