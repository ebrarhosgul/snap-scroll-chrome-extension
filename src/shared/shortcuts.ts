export const renderCommands = async (container: HTMLElement) => {
  try {
    const commands = await chrome.commands.getAll();
    container.innerHTML = '';

    const labelMap: Record<string, string> = {
      'save_checkpoint': 'Save/Update:',
      'jump_checkpoint': 'Jump back:',
      'delete_checkpoint': 'Delete:'
    };

    commands.forEach(cmd => {
      if (!cmd.name || !labelMap[cmd.name]) return;
      
      const label = labelMap[cmd.name];
      let formattedShortcut = 'Not set';

      if (cmd.shortcut) {
        formattedShortcut = cmd.shortcut
          .split('')
          .map(key => `<kbd>${key.trim()}</kbd>`)
          .join(' + ');
      }
      
      container.innerHTML += `
        <div class="shortcut-row">
          <span>${label}</span>
          <span class="shortcut-keys">${formattedShortcut}</span>
        </div>
      `;
    });
  } catch (error) {
    console.error('Failed to load commands', error);
  }
};
