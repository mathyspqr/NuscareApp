
export const navigation = [
  {
    text: 'Accueil',
    path: '/home',
    icon: 'home'
  },
  {
    text: 'Outils',
    icon: 'folder',
    items: [
      {
        text: 'Profile',
        icon: 'user',
        path: '/profile'
      },
      {
        text: 'Administration',
        icon: 'group',
        path: '/administration'
      },
      {
        text: 'Patient',
        icon: 'card',
        path: '/patient'
      },
      {
        text: 'Agenda Prévisionnel',
        icon: 'event',
        path: '/agenda'
      },
      {
        text: 'Tache',
        icon: 'doc',
        path: '/tasks'
      }
    ]
  }
];
