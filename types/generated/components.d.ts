import type { Schema, Struct } from '@strapi/strapi';

export interface YellowDayPartners extends Struct.ComponentSchema {
  collectionName: 'components_yellow_day_partners';
  info: {
    displayName: 'Partners';
  };
  attributes: {
    PartnerLogo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    PartnerTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'yellow-day.partners': YellowDayPartners;
    }
  }
}
