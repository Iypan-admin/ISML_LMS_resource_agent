export interface RawResourceRow {
  tutorName: string;
  category: string;
  title: string;
  level: string;
  purpose: string;
  link: string;
  language: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRawRow(row: any): ValidationResult {
  const errors: string[] = [];

  if (!row || typeof row !== 'object') {
    return { isValid: false, errors: ['Row must be a non-null object'] };
  }

  if (!row.tutorName || typeof row.tutorName !== 'string' || !row.tutorName.trim()) {
    errors.push('tutorName is missing or empty');
  }

  if (!row.category || typeof row.category !== 'string' || !row.category.trim()) {
    errors.push('category is missing or empty');
  }

  if (!row.title || typeof row.title !== 'string' || !row.title.trim()) {
    errors.push('title is missing or empty');
  }

  if (!row.purpose || typeof row.purpose !== 'string' || !row.purpose.trim()) {
    errors.push('purpose is missing or empty');
  }

  if (!row.link || typeof row.link !== 'string' || !row.link.trim()) {
    errors.push('link is missing or empty');
  } else {
    try {
      const parsed = new URL(row.link);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.push(`link must use http or https protocol (got '${parsed.protocol}')`);
      }
    } catch {
      errors.push(`link '${row.link}' is not a valid URL`);
    }
  }

  if (!row.language || typeof row.language !== 'string' || !row.language.trim()) {
    errors.push('language is missing or empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
