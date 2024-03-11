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
        text: 'Patient',
        icon: 'card',
        path: '/patient'
      },
      {
        text: 'Agenda Prévisionnel',
        icon: 'event',
        path: '/agenda'
      },
    ]
  },
  {
    text: 'Administration',
    icon: 'group',
    items: [
      {
        text: 'Tableau de bord',
        icon: 'dataarea',
        path: 'dashboard'
      },
      {
        text: 'Rôle',
        icon: 'tags',
        path: '/administration'
      },
    ]
  },
  {
    text: 'Outils des secretaires',
    icon: 'like',
    items: [
      {
        text: 'Créer des interventions',
        icon: 'event',
        path: 'creationintervention'
      },
      {
        text: 'Modifier Intervention & Prestation',
        icon: 'revert',
        path: 'editionintervention'
      },
    ]
  },
];
