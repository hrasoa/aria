'use strict';
const path = require('path');

module.exports = {
  plugins: [
    {
      name: 'typescript',
      options: {
        forkTsChecker: {
          reportFiles: ['src/**/*.{ts,tsx}', '../src/**/*.{ts,tsx}'],
        },
      },
    },
  ],
  modify: (config, { target, dev }, webpack) => {
    const resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        lib: path.resolve(__dirname, '../src'),
      },
    };

    const rules = config.module.rules.map(rule => {
      if (rule.test && '.tsx'.match(rule.test)) {
        return {
          ...rule,
          include: [...rule.include, path.resolve(__dirname, '../src')].filter(
            Boolean
          ),
        };
      }
      return rule;
    });
    return {
      ...config,
      resolve,
      module: {
        ...config.module,
        rules,
      },
    };
  },
};
