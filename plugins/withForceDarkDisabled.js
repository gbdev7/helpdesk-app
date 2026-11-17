// Impede o "modo escuro forçado" do Android/MIUI de inverter as cores do app.
const { withAndroidStyles } = require('expo/config-plugins');

module.exports = (config) =>
  withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults;
    const appTheme = (styles.resources.style || []).find((s) => s.$.name === 'AppTheme');
    if (appTheme) {
      appTheme.item = appTheme.item || [];
      if (!appTheme.item.some((i) => i.$.name === 'android:forceDarkAllowed')) {
        appTheme.item.push({ $: { name: 'android:forceDarkAllowed' }, _: 'false' });
      }
    }
    return cfg;
  });
