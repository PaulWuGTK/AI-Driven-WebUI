// French translations
export default {
  menu: {
    dashboard: 'Dashboard',  // 或「Interface de gestion」
    status: 'Statut',
    wan: 'WAN',
    lan: 'LAN',
    wlan: 'WLAN',
    statistics: 'Statistiques',
    wifiNeighbor: 'Appareils voisins WiFi',
    meshInfo: 'Informations sur le maillage',
    lcm: 'LCM',
    basicSetting: 'Paramètres de base',
    wireless: 'Sans fil',
    management: 'Gestion',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: 'Avancé',
    ddns: 'DDNS'
  },
  header: {
    account: 'Compte',
    logout: 'Déconnexion'
  },
  dashboard: {
    system: 'Système',
    model: 'Modèle',
    serialNumber: 'Numéro de série',
    cpu: 'CPU',
    processes: 'Processus',
    memory: 'Mémoire',
    total: 'Total',
    free: 'Libre',
    used: 'Utilisé',
    wan: 'WAN',
    status: 'État',
    speed: 'Vitesse',
    received: 'Reçu',
    sent: 'Envoyé',
    wifi: 'WiFi',
    clients: 'Clients',
    ethernet: 'Ports Ethernet'
  },
  wan: {
    title: 'État du WAN',
    operationMode: 'Mode opératoire',
    sensingPolicy: 'Politique de détection',
    sensingTimeout: 'Délai de détection',
    name: 'Nom',
    wanMode: 'Mode WAN',
    interface: 'Interface',
    macAddress: 'Adresse MAC',
    speed: 'Vitesse de connexion',
    duplex: 'Duplex',
    ipv4Address: 'Adresse IPv4',
    status: 'État',
    wanModeConfig: 'Configuration du mode WAN',
    dnsMode: 'Mode DNS',
    physicalType: 'Type physique',
    origin: 'Origine',
    mode: 'Mode',
    address: 'Adresse',
    gateway: 'Passerelle',
    dnsServer: 'Serveur DNS',
    subnetMask: 'Masque sous-réseau',
    type: 'Type',
    prefix: 'Préfixe'
  },
  lan: {
    title: 'LAN',
    macAddress: 'Adresse MAC',
    mtu: 'MTU',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    name: 'Nom',
    ipAddress: 'Adresse IP',
    netmask: 'Masque de sous-réseau',
    status: 'Statut'
  },
  wlan: {
    title: 'État du WLAN',
    channel: 'Canal',
    bandwidth: 'Bande passante',
    macAddress: 'Adresse MAC',
    interface: 'Interface',
    name: 'Nom',
    alias: 'Alias',
    status: 'Statut',
    ssid: 'SSID',
    authentication: 'Authentification',
    encryption: 'Chiffrement',
    password: 'Mot de passe',
    bssid: 'BSSID',
    auto: '(auto)',
    enable: 'Activer',
    disable: 'Désactiver'
  },
  statistics: {
    title: 'Statistiques',
    ethernet: 'Statistiques - Ethernet',
    wlan: 'Statistiques - WLAN',
    port: 'Port',
    rxBytes: 'RxBytes',
    rxPackets: 'Paquets Rx',
    rxError: 'Erreur Rx',
    rxDiscard: 'Paquets rejetés Rx',
    txBytes: 'TxBytes',
    txPackets: 'Paquets Tx',
    txError: 'Erreur Tx',
    txDiscard: 'Paquets rejetés Tx'
  },
    wifiNeighbor: {
    title: 'Voisins WiFi',
    wifiNeighbor: 'Voisin WiFi',
    ssid: 'SSID',
    bssid: 'BSSID',
    channel: 'Canal',
    signal: 'Signal (%)',
    security: 'Sécurité',
    wirelessMode: 'Mode sans fil',
    scan: 'SCANNER',
    scanning: 'Scan en cours...'
  },
  mesh: {
    title: 'Informations Mesh',
    networkInformation: 'Informations Réseau Mesh',
    nodeList: 'Liste des Nœuds Mesh',
    clientList: 'Liste des Clients Mesh',
    name: 'Nom',
    mode: 'Mode',
    ipAddress: 'Adresse IPv4',
    macAddress: 'Adresse MAC',
    mediaType: 'Type de Média',
    supportedBand: 'Bande Supportée',
    upstream: 'En Amont',
    action: 'Action',
    map: 'CARTE',
    list: 'LISTE',
    back: 'Retour',
    steeringControl: 'Contrôle de Direction',
    selectedNode: 'Nœud Sélectionné',
    destination: 'Destination',
    selectDestination: 'Sélectionner la Destination',
    band: 'Bande',
    selectBand: 'Sélectionner la Bande'
  },
  wireless: {
    title: 'Paramètres sans fil',
    basicConfig: 'Configuration de base',
    advancedConfig: 'Configuration avancée',
    wpsConfig: 'Configuration WPS',
    meshNetwork: 'Réseau Mesh',
    settings: 'Paramètres',
    ssid: 'SSID',
    password: 'Clé WPA',
    mode: 'Mode',
    bandwidth: 'Bande passante',
    channel: 'Canal',
    autoChannel: 'Canal automatique',
    wpsConfiguration: 'Configuration WPS',
    wpsPushButton: 'Bouton WPS',
    wpsPushButtonDesc: 'Cliquez sur "Bouton WPS" puis appuyez sur le bouton WPS de l\'appareil à connecter dans les deux minutes',
    wpsPinConnect: 'Connexion par code PIN WPS',
    wpsPinConnectDesc: 'Entrez le code PIN généré par l\'appareil client, puis cliquez sur le bouton "Connecter l\'appareil" pour établir la connexion WiFi.',
    generatePinCode: 'Générer code PIN',
    devicePinDesc: 'PIN pour ajouter cet appareil à un réseau',
    enterPin: 'Veuillez entrer le code PIN',
    connect: 'Connecter l\'appareil',
    vapInformation: 'Informations VAP',
    band: 'Bande',
    authentication: 'Authentification',
    encryption: 'Chiffrement',
    wpsStatus: 'État WPS',
    easyMesh: 'EasyMesh',
    commonSsidConfig: 'Configuration SSID commune'
  },
  ddns: {
    title: 'Paramètres DDNS',
    management: 'Gestion DDNS',
    addService: 'Ajouter un service',
    editService: 'Modifier le service',
    refresh: 'Actualiser',
    no: 'N°',
    provider: 'Fournisseur',
    domain: 'Nom de domaine',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    wanInterface: 'Interface WAN',
    status: 'État',
    lastUpdate: 'Dernière mise à jour',
    action: 'Action',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce service DDNS ?'
  },
  ntp: {
    title: 'NTP',
    currentTime: 'Heure actuelle',
    timeZoneSelect: 'Sélection du fuseau horaire',
    automaticDaylight: 'Ajustement automatique à l\'heure d\'été',
    enableNtp: 'Activer la mise à jour du client NTP',
    ntpServer: 'Serveur NTP',
    cancel: 'Annuler',
    apply: 'Appliquer',
    placeholder: 'Veuillez saisir une valeur'
  },
  ssh: {
    title: 'SSH',
    serverManagement: 'Gestion du serveur SSH',
    publicKeyManagement: 'Gestion des clés publiques',
    currentSessions: 'Sessions actuelles',
    addServer: 'Ajouter un serveur',
    editServer: 'Modifier le serveur',
    id: 'ID',
    interface: 'Interface',
    status: 'État',
    port: 'Port',
    autoDisableServer: 'Désactivation automatique du serveur',
    connectionTimeout: 'Délai de connexion',
    keepAliveMessage: 'Message KeepAlive',
    ipv4Prefix: 'Préfixe IPv4',
    ipv6Prefix: 'Préfixe IPv6',
    loginWithPassword: 'Connexion avec mot de passe',
    rootLogin: 'Connexion root',
    rootLoginWithPassword: 'Connexion root avec mot de passe',
    enabled: 'Activé',
    disabled: 'Désactivé',
    action: 'Action',
    enable: 'Activer le serveur SSH',
    allowPasswordLogin: 'Autoriser la connexion par mot de passe',
    allowRootLogin: 'Autoriser la connexion root',
    maxAuthTries: 'Nombre maximal de tentatives d\'authentification',
    idleTimeout: 'Délai d\'inactivité (secondes)',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce serveur SSH ?',
    comment: 'Commentaire',
    publicKey: 'Clé publique',
    select: 'Sélectionner',
    clickToView: 'Cliquer pour voir',
    key: 'Clé publique',
    viewKey: 'Voir la clé',
    newSshKey: 'Nouvelle clé SSH',
    enterNewSshKey: 'Entrer une nouvelle clé SSH...',
    confirmDeleteKey: 'Êtes-vous sûr de vouloir supprimer cette clé SSH ?',
    user: 'Utilisateur',
    clientAddress: 'Adresse client',
    clientPort: 'Port client',
    serverId: 'ID serveur',
    serverPort: 'Port serveur',
    algorithm : 'Algorithme'
  },
  login: {
    title: 'Connexion',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    submit: 'Connexion',
    error: 'Nom d\'utilisateur ou mot de passe invalide'
  },
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    refresh: 'Actualiser',
    create: 'Créer',
    apply: 'Appliquer',
    edit: 'Modifier',
    delete: 'Supprimer',
    enable: 'Activer',
  }
};