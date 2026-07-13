/** OpenAPI route schemas — imported by route handlers for Swagger docs. */

export const tags = {
  health: 'Health',
  auth: 'Auth',
  scripture: 'Scripture',
  profile: 'Profile',
  library: 'Library',
  beta: 'Beta',
  stories: 'Stories',
  ai: 'AI',
} as const;

export const errorResponse = {
  type: 'object',
  properties: { error: { type: 'string' } },
  required: ['error'],
} as const;

export const bearerSecurity = [{ bearerAuth: [] }] as const;

export const schemas = {
  health: {
    tags: [tags.health],
    summary: 'Health check',
    response: {
      200: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          db: { type: 'boolean' },
        },
        required: ['ok', 'db'],
      },
    },
  },

  bibleSearch: {
    tags: [tags.scripture],
    summary: 'Search scripture (OT + NT keyword index)',
    querystring: {
      type: 'object',
      properties: { q: { type: 'string' } },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          ot: { type: 'array', items: { type: 'object', additionalProperties: true } },
          nt: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
    },
  },

  bibleChapter: {
    tags: [tags.scripture],
    summary: 'Get a Bible chapter',
    params: {
      type: 'object',
      properties: {
        book: { type: 'string', examples: ['psalms'] },
        chapter: { type: 'string', examples: ['23'] },
      },
      required: ['book', 'chapter'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          reference: { type: 'string' },
          verses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                n: { type: 'integer' },
                t: { type: 'string' },
              },
            },
          },
        },
      },
      404: errorResponse,
    },
  },

  biblePassage: {
    tags: [tags.scripture],
    summary: 'Get a passage by reference',
    querystring: {
      type: 'object',
      properties: { ref: { type: 'string', examples: ['John 3:16'] } },
      required: ['ref'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          ref: { type: 'string' },
          text: { type: 'string' },
        },
      },
      400: errorResponse,
      404: errorResponse,
    },
  },

  todayVerse: {
    tags: [tags.scripture],
    summary: "Today's verse",
    response: {
      200: {
        type: 'object',
        properties: {
          ref: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
  },

  verseForCarrying: {
    tags: [tags.scripture],
    summary: 'Verse matched to onboarding carrying tags',
    querystring: {
      type: 'object',
      properties: { tags: { type: 'string', description: 'Comma-separated tags', examples: ['Worry,Hope'] } },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          ref: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
  },

  authGuest: {
    tags: [tags.auth],
    summary: 'Guest login (device ID)',
    body: {
      type: 'object',
      properties: { deviceId: { type: 'string' } },
      required: ['deviceId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          session: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'integer' },
            },
          },
          user: { type: 'object', additionalProperties: true },
        },
      },
      400: errorResponse,
    },
  },

  authRefresh: {
    tags: [tags.auth],
    summary: 'Refresh access token',
    body: {
      type: 'object',
      properties: { refresh: { type: 'string' } },
      required: ['refresh'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          session: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'integer' },
            },
          },
        },
      },
      400: errorResponse,
      401: errorResponse,
    },
  },

  getMe: {
    tags: [tags.profile],
    summary: 'Get current user + profile',
    security: bearerSecurity,
    response: {
      200: { type: 'object', additionalProperties: true },
      401: errorResponse,
      404: errorResponse,
    },
  },

  patchMe: {
    tags: [tags.profile],
    summary: 'Update profile',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        carrying: { type: 'array', items: { type: 'string' } },
        gentleness: { type: 'string' },
        rhythm: { type: 'string' },
        onboarded: { type: 'boolean' },
      },
    },
    response: {
      200: { type: 'object', additionalProperties: true },
      401: errorResponse,
      404: errorResponse,
    },
  },

  listSaved: {
    tags: [tags.library],
    summary: 'List saved verses',
    security: bearerSecurity,
    response: {
      200: { type: 'array', items: { type: 'object', additionalProperties: true } },
      401: errorResponse,
    },
  },

  addSaved: {
    tags: [tags.library],
    summary: 'Save a verse',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: {
        ref: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['ref', 'text'],
    },
    response: {
      201: {
        type: 'object',
        properties: { ref: { type: 'string' }, text: { type: 'string' } },
      },
      400: errorResponse,
      401: errorResponse,
    },
  },

  deleteSaved: {
    tags: [tags.library],
    summary: 'Delete a saved verse by ref',
    security: bearerSecurity,
    params: {
      type: 'object',
      properties: { '*': { type: 'string', description: 'URL-encoded verse ref' } },
    },
    response: {
      204: { type: 'null', description: 'Deleted' },
      400: errorResponse,
      401: errorResponse,
      404: errorResponse,
    },
  },

  listReflections: {
    tags: [tags.library],
    summary: 'List word reflections',
    security: bearerSecurity,
    response: {
      200: { type: 'array', items: { type: 'object', additionalProperties: true } },
      401: errorResponse,
    },
  },

  addReflection: {
    tags: [tags.library],
    summary: 'Add a word reflection',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: {
        word: { type: 'string' },
        note: { type: 'string' },
        ref: { type: 'string' },
      },
      required: ['word'],
    },
    response: {
      201: { type: 'object', additionalProperties: true },
      400: errorResponse,
      401: errorResponse,
    },
  },

  listProgress: {
    tags: [tags.library],
    summary: 'List reading progress',
    security: bearerSecurity,
    response: {
      200: { type: 'array', items: { type: 'object', additionalProperties: true } },
      401: errorResponse,
    },
  },

  upsertProgress: {
    tags: [tags.library],
    summary: 'Upsert reading progress',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: {
        book: { type: 'string' },
        chapter: { type: 'integer' },
        position: { type: 'number', description: 'Scroll position 0–1 within chapter' },
      },
      required: ['book', 'chapter', 'position'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          book: { type: 'string' },
          chapter: { type: 'integer' },
          position: { type: 'number', description: 'Scroll position 0–1 within chapter' },
        },
      },
      400: errorResponse,
      401: errorResponse,
    },
  },

  betaRedeem: {
    tags: [tags.beta],
    summary: 'Redeem beta subscription code',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: ['code'],
    },
    response: {
      200: { type: 'object', additionalProperties: true },
      400: errorResponse,
      401: errorResponse,
    },
  },

  listStories: {
    tags: [tags.stories],
    summary: 'Story catalog (featured, collections, all stories)',
    response: {
      200: { type: 'object', additionalProperties: true },
    },
  },

  getStory: {
    tags: [tags.stories],
    summary: 'Get story metadata',
    params: {
      type: 'object',
      properties: { id: { type: 'string', examples: ['ruth-stays'] } },
      required: ['id'],
    },
    response: {
      200: { type: 'object', additionalProperties: true },
      404: errorResponse,
    },
  },

  storyNarrative: {
    tags: [tags.ai],
    summary: 'Generate LLM story narration (personalized)',
    security: bearerSecurity,
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: { part: { type: 'integer', minimum: 1, default: 1 } },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          storyId: { type: 'string' },
          part: { type: 'integer' },
          content: { type: 'string' },
          cached: { type: 'boolean' },
        },
      },
      400: errorResponse,
      401: errorResponse,
      404: errorResponse,
    },
  },

  aiReminder: {
    tags: [tags.ai],
    summary: 'Generate LLM reminder notification copy',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['morning', 'evening', 'both', 'off'] },
        morningTime: { type: 'string', examples: ['07:00'] },
        eveningTime: { type: 'string', examples: ['21:00'] },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          notification: { type: 'string' },
          preview: { type: 'string' },
        },
      },
      400: errorResponse,
      401: errorResponse,
    },
  },

  aiSupport: {
    tags: [tags.ai],
    summary: 'Submit support message and get Grace LLM reply',
    security: bearerSecurity,
    body: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        message: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
      required: ['message'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string' },
          reply: { type: 'string' },
        },
      },
      400: errorResponse,
      401: errorResponse,
    },
  },
};
