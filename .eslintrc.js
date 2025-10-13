module.exports = {
  plugins: ['@typescript-eslint'], // Ensure the plugin is included
  extends: [
    'plugin:@typescript-eslint/recommended', // Extend recommended rules
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off', // Disable the rule globally
  },
};