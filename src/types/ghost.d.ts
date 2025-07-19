declare module '@tryghost/content-api' {
  interface GhostAPIConfig {
    url: string;
    key: string;
    version: string;
  }

  interface Author {
    id: string;
    name: string;
    slug: string;
    profile_image?: string;
    cover_image?: string;
    bio?: string;
    website?: string;
    location?: string;
    facebook?: string;
    twitter?: string;
    meta_title?: string;
    meta_description?: string;
    url: string;
  }

  interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    feature_image?: string;
    visibility: string;
    meta_title?: string;
    meta_description?: string;
    url: string;
  }

  interface Post {
    id: string;
    uuid: string;
    title: string;
    slug: string;
    html: string;
    comment_id: string;
    feature_image?: string;
    feature_image_alt?: string;
    feature_image_caption?: string;
    featured: boolean;
    visibility: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    custom_excerpt?: string;
    codeinjection_head?: string;
    codeinjection_foot?: string;
    custom_template?: string;
    canonical_url?: string;
    authors?: Author[];
    tags?: Tag[];
    primary_author?: Author;
    primary_tag?: Tag;
    url: string;
    excerpt: string;
    reading_time: number;
    access: boolean;
    send_email_when_published: boolean;
    og_image?: string;
    og_title?: string;
    og_description?: string;
    twitter_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    meta_title?: string;
    meta_description?: string;
    email_subject?: string;
  }

  interface Page {
    id: string;
    uuid: string;
    title: string;
    slug: string;
    html: string;
    comment_id: string;
    feature_image?: string;
    featured: boolean;
    visibility: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    custom_excerpt?: string;
    codeinjection_head?: string;
    codeinjection_foot?: string;
    custom_template?: string;
    canonical_url?: string;
    authors?: Author[];
    tags?: Tag[];
    primary_author?: Author;
    primary_tag?: Tag;
    url: string;
    excerpt: string;
    reading_time: number;
    access: boolean;
    og_image?: string;
    og_title?: string;
    og_description?: string;
    twitter_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    meta_title?: string;
    meta_description?: string;
  }

  interface Settings {
    title: string;
    description: string;
    logo?: string;
    icon?: string;
    accent_color?: string;
    cover_image?: string;
    facebook?: string;
    twitter?: string;
    lang: string;
    timezone: string;
    codeinjection_head?: string;
    codeinjection_foot?: string;
    navigation?: Array<{
      label: string;
      url: string;
    }>;
    secondary_navigation?: Array<{
      label: string;
      url: string;
    }>;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    og_title?: string;
    og_description?: string;
    twitter_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    url: string;
  }

  interface BrowseOptions {
    limit?: number | 'all';
    page?: number;
    fields?: string;
    filter?: string;
    include?: string | string[];
    order?: string;
    formats?: string;
  }

  interface BrowseResponse<T> {
    data?: T[];
    meta: {
      pagination: {
        page: number;
        limit: number;
        pages: number;
        total: number;
        next?: number;
        prev?: number;
      };
    };
  }

  class GhostContentAPI {
    constructor(config: GhostAPIConfig);
    
    posts: {
      browse(options?: BrowseOptions): Promise<Post[] | BrowseResponse<Post>>;
      read(data: { slug: string } | { id: string }, options?: BrowseOptions): Promise<Post>;
    };

    pages: {
      browse(options?: BrowseOptions): Promise<Page[]>;
      read(data: { slug: string } | { id: string }, options?: BrowseOptions): Promise<Page>;
    };

    authors: {
      browse(options?: BrowseOptions): Promise<Author[]>;
      read(data: { slug: string } | { id: string }, options?: BrowseOptions): Promise<Author>;
    };

    tags: {
      browse(options?: BrowseOptions): Promise<Tag[]>;
      read(data: { slug: string } | { id: string }, options?: BrowseOptions): Promise<Tag>;
    };

    settings: {
      browse(): Promise<Settings>;
    };
  }

  export = GhostContentAPI;
}