export function generateDefaultProfiles() {
    const profiles = new Map();
    for (let i = 30; i >= 1; i--) {
      profiles.set(`${i}-D`, 0);
    }
    return profiles;
  }
  