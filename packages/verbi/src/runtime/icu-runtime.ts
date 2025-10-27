export function formatMessage(
  message: string,
  values: Record<string, unknown>,
  locale: string
): string {
  // Simple variable replacement
  let result = message;

  for (const [key, value] of Object.entries(values)) {
    // Handle simple placeholders {variable}
    const simpleRegex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(simpleRegex, String(value));

    // Handle plural {count, plural, one {...} other {...}}
    const pluralRegex = new RegExp(
      `\\{${key},\\s*plural,\\s*([^}]+)\\}`,
      'g'
    );

    result = result.replace(pluralRegex, (_match, rules) => {
      const count = Number(value);
      const pluralRules = new Intl.PluralRules(locale);
      const rule = pluralRules.select(count);

      // Parse plural rules
      const ruleMatches = rules.match(/(\w+)\s*\{([^}]+)\}/g) || [];
      const ruleMap = new Map<string, string>();

      for (const ruleMatch of ruleMatches) {
        const [, ruleName, ruleContent] = ruleMatch.match(/(\w+)\s*\{([^}]+)\}/) || [];
        if (ruleName && ruleContent) {
          ruleMap.set(ruleName, ruleContent);
        }
      }

      // Handle special cases
      if (count === 0 && ruleMap.has('zero')) {
        return ruleMap.get('zero')!.replace(/#/g, String(count));
      }
      if (count === 1 && ruleMap.has('one')) {
        return ruleMap.get('one')!.replace(/#/g, String(count));
      }

      // Use the rule from Intl.PluralRules
      const template = ruleMap.get(rule) || ruleMap.get('other') || String(count);
      return template.replace(/#/g, String(count));
    });

    // Handle select {gender, select, male {...} female {...} other {...}}
    const selectRegex = new RegExp(
      `\\{${key},\\s*select,\\s*([^}]+)\\}`,
      'g'
    );

    result = result.replace(selectRegex, (_match, options) => {
      const selectValue = String(value);

      // Parse select options
      const optionMatches = options.match(/(\w+)\s*\{([^}]+)\}/g) || [];
      const optionMap = new Map<string, string>();

      for (const optionMatch of optionMatches) {
        const [, optionName, optionContent] = optionMatch.match(/(\w+)\s*\{([^}]+)\}/) || [];
        if (optionName && optionContent) {
          optionMap.set(optionName, optionContent);
        }
      }

      return optionMap.get(selectValue) || optionMap.get('other') || selectValue;
    });
  }

  return result;
}