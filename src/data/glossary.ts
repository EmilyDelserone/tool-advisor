export type GlossaryEntry = {
  id: string;
  term: string;
  /** Phrases in question and recommendation copy that should surface this entry */
  patterns: string[];
  definition: string;
  example: string;
};

export const glossary: GlossaryEntry[] = [
  {
    id: 'ui',
    term: 'UI (User Interface)',
    patterns: ['UI'],
    definition:
      'The screens, buttons, and forms a person actually interacts with, as opposed to automation that runs invisibly in the background.',
    example:
      "A mobile form where a field tech types in inspection results has a UI. A nightly process that moves files between folders doesn't.",
  },
  {
    id: 'business-logic',
    term: 'Business logic',
    patterns: ['business logic'],
    definition:
      'The rules that decide what should happen, not just what a screen looks like — like "if the request is over $5,000, require manager approval."',
    example:
      '"Route expense reports over $500 to a director for approval" is business logic; "make the submit button blue" is not.',
  },
  {
    id: 'integration',
    term: 'Integrating multiple systems',
    patterns: ['integrating multiple systems', 'enterprise integration', 'integration'],
    definition:
      'Making two or more separate tools/apps talk to each other automatically, instead of someone manually copying data between them.',
    example:
      'Automatically creating a record in your CRM whenever a new deal closes in your finance system.',
  },
  {
    id: 'scheduled-event',
    term: 'Scheduled event (trigger)',
    patterns: ['scheduled or event-driven', 'scheduled', 'event-driven'],
    definition:
      'Something that kicks off automatically at a set time, rather than because a person clicked something.',
    example:
      '"Every Monday at 8am, email the team a summary of last week\'s tickets" is a scheduled trigger.',
  },
  {
    id: 'connector',
    term: 'Connector',
    patterns: ['connectors', 'connector'],
    definition:
      'A pre-built bridge that lets a tool talk to a specific other app or service (like Outlook, SharePoint, or Salesforce) without you writing custom code.',
    example:
      "Using the built-in SharePoint connector to grab a file, instead of writing code to call SharePoint's API directly.",
  },
  {
    id: 'citizen-developer',
    term: 'Citizen developer',
    patterns: ['citizen developers', 'citizen developer'],
    definition:
      'A business user who builds apps/automations without being a professional software engineer, usually with low-code tools.',
    example:
      'An operations manager building their own approval app in Power Apps, without involving IT.',
  },
];
