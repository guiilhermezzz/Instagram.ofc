export interface CommentItem {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

export interface Post {
  id: string;
  image: string;
  videoUrl?: string;
  posterUrl?: string;
  authorUsername?: string;
  authorAvatar?: string;
  location?: string;
  likes: number;
  comments: CommentItem[];
  caption: string;
  time: string;
  createdAt?: string;
  type: "photo" | "reel";
  views?: string;
}

export interface StorySet {
  id: string;
  title: string;
  images: string[];
  times: string[];
}

export interface Highlight {
  id: string;
  title: string;
  cover: string;
  stories: StorySet;
}

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;

const av = (img: number) => `https://i.pravatar.cc/96?img=${img}`;

const c1: CommentItem[] = [
  {
    id: "c1",
    user: "lulu.viaja",
    avatar: av(44),
    text: "Amei demais! Já salvei como inspiração pra próxima viagem",
    likes: 18,
    time: "2 d",
  },
  {
    id: "c2",
    user: "pedrohfotos",
    avatar: av(12),
    text: "A composição ficou perfeita. Qual lente você usou aqui?",
    likes: 9,
    time: "2 d",
  },
  {
    id: "c3",
    user: "anaclara.sp",
    avatar: av(32),
    text: "Incrível como você captura a luz, parece pintura",
    likes: 31,
    time: "1 d",
  },
];

const c2: CommentItem[] = [
  {
    id: "c4",
    user: "carlos.aventura",
    avatar: av(15),
    text: "Que lugar surreal! Preciso conhecer urgentemente",
    likes: 24,
    time: "4 d",
  },
  {
    id: "c5",
    user: "marcos.lens",
    avatar: av(59),
    text: "Sem palavras. Referência demais, Marina",
    likes: 12,
    time: "3 d",
  },
];

const c3: CommentItem[] = [
  {
    id: "c6",
    user: "bia.destinos",
    avatar: av(47),
    text: "Esse reels me convenceu a ir. Obrigada pelo roteiro!",
    likes: 56,
    time: "6 d",
  },
  {
    id: "c7",
    user: "tomas.travel",
    avatar: av(7),
    text: "As cores nem parecem reais de tão bonitas",
    likes: 21,
    time: "5 d",
  },
  {
    id: "c8",
    user: "anaclara.sp",
    avatar: av(32),
    text: "Maravilhosa por dentro e por fora das lentes",
    likes: 8,
    time: "5 d",
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    image: px(24039573),
    location: "Arpoador, Rio de Janeiro",
    likes: 12847,
    comments: c1,
    caption:
      "O pôr do sol mais aplaudido do mundo. O Arpoador nunca decepciona, e olha que eu já vi muito sol se pôr por aí.",
    time: "2 dias",
    type: "photo",
  },
  {
    id: "p2",
    image: px(13282199),
    location: "La Gomera, Ilhas Canárias",
    likes: 9432,
    comments: c2,
    caption:
      "Uma ilha inteira flutuando entre nuvens. La Gomera é o tipo de lugar que a foto nunca faz justiça.",
    time: "5 dias",
    type: "photo",
  },
  {
    id: "p3",
    image: px(1606618),
    location: "Tenerife, Espanha",
    likes: 8215,
    comments: c2.slice(0, 1),
    caption:
      "Névoa, mar e montanha no mesmo enquadramento. O amanhecer de Tenerife vale cada minuto de sono perdido.",
    time: "1 semana",
    type: "photo",
  },
  {
    id: "p4",
    image: px(18266099),
    location: "Costa norte, Tenerife",
    likes: 15320,
    comments: c3,
    caption:
      "O som das ondas batendo nessas falésias é hipnotizante. Reels completo dos 5 melhores mirantes da ilha.",
    time: "1 semana",
    type: "reel",
    views: "312 mil",
  },
  {
    id: "p5",
    image: px(18045241),
    location: "Praia de Benijo",
    likes: 11203,
    comments: c3.slice(0, 2),
    caption:
      "Fim de tarde dramático do jeito que eu gosto: nuvens pesadas, maré baixa e ninguém por perto.",
    time: "2 semanas",
    type: "photo",
  },
  {
    id: "p6",
    image: px(33843300),
    location: "Vallehermoso, Canárias",
    likes: 7891,
    comments: c2,
    caption:
      "Verde que não cabe no quadradinho. Vallehermoso é o segredo mais bem guardado das Canárias.",
    time: "2 semanas",
    type: "photo",
  },
  {
    id: "p7",
    image: px(29218836),
    location: "Lisboa, Portugal",
    likes: 6548,
    comments: c1.slice(0, 2),
    caption:
      "Ritual de viagem: croissant, café gelado e o mapa aberto decidindo o próximo destino.",
    time: "3 semanas",
    type: "photo",
  },
  {
    id: "p8",
    image: px(27051129),
    location: "Ilha Bartolomeu, Galápagos",
    likes: 10564,
    comments: c3.slice(0, 2),
    caption:
      "Caminhar por Galápagos é visitar outro planeta sem sair da Terra. Cada pedra aqui tem milhões de anos de história.",
    time: "3 semanas",
    type: "photo",
  },
  {
    id: "p9",
    image: px(34644109),
    location: "Istambul, Turquia",
    likes: 9870,
    comments: c3,
    caption:
      "Café da manhã turco, livro aberto e o Bósforo logo ali. Reels dos cafés mais bonitos de Istambul no ar.",
    time: "4 semanas",
    type: "reel",
    views: "189 mil",
  },
  {
    id: "p10",
    image: px(14437072),
    location: "Costa Amalfitana, Itália",
    likes: 9102,
    comments: c1.slice(0, 2),
    caption:
      "Vilas empilhadas entre o mar e a floresta. A Costa Amalfitana parece cenário de filme em qualquer ângulo.",
    time: "1 mês",
    type: "photo",
  },
  {
    id: "p11",
    image: px(27051121),
    location: "Pinnacle Rock, Galápagos",
    likes: 8977,
    comments: c2.slice(0, 1),
    caption:
      "A silhueta do Pinnacle Rock ao entardecer. Galápagos entrega um cartão-postal a cada 10 minutos.",
    time: "1 mês",
    type: "photo",
  },
  {
    id: "p12",
    image: px(32350985),
    location: "Paris, França",
    likes: 5432,
    comments: c1.slice(0, 1),
    caption:
      "Tortinhas de morango, café passado e uma manhã inteira sem pressa em Paris.",
    time: "1 mês",
    type: "photo",
  },
  {
    id: "p13",
    image: px(33089293),
    location: "Brunch em Copenhague",
    likes: 18942,
    comments: c3,
    caption:
      "Brunch com flores frescas e design dinamarquês. Reels com os 7 brunchs mais instagramáveis da Europa.",
    time: "1 mês",
    type: "reel",
    views: "427 mil",
  },
  {
    id: "p14",
    image: px(20677077),
    location: "Road trip, Toscana",
    likes: 7890,
    comments: c2.slice(0, 1),
    caption:
      "Parada estratégica na estrada: croissant de amêndoas, revista velha e as colinas da Toscana de pano de fundo.",
    time: "2 meses",
    type: "photo",
  },
];

export const taggedPosts: Post[] = [
  {
    id: "t1",
    image: px(15872890),
    location: "Estúdio Aurora",
    likes: 4231,
    comments: c1.slice(0, 1),
    caption: "Foto publicada por @studio.aurora",
    time: "3 semanas",
    type: "photo",
  },
  {
    id: "t2",
    image: px(16135656),
    location: "Bastidores — Revista Horizonte",
    likes: 3877,
    comments: [],
    caption: "Bastidores publicados por @revista.horizonte",
    time: "1 mês",
    type: "photo",
  },
  {
    id: "t3",
    image: px(15228001),
    location: "Workshop de fotografia urbana",
    likes: 5102,
    comments: c2.slice(0, 1),
    caption: "Workshop publicado por @foto.urbana.sp",
    time: "2 meses",
    type: "photo",
  },
];

export const myStory: StorySet = {
  id: "me",
  title: "meu perfil",
  images: [px(24039573), px(29218836), px(14437072)],
  times: ["14 h", "11 h", "8 h"],
};

export const highlights: Highlight[] = [
  {
    id: "h1",
    title: "Rio",
    cover: px(24039573),
    stories: {
      id: "h1s",
      title: "Rio",
      images: [px(24039573), px(18045241), px(18266099)],
      times: ["12 sem", "12 sem", "12 sem"],
    },
  },
  {
    id: "h2",
    title: "Galápagos",
    cover: px(27051121),
    stories: {
      id: "h2s",
      title: "Galápagos",
      images: [px(27051121), px(27051129), px(27051130)],
      times: ["9 sem", "9 sem", "9 sem"],
    },
  },
  {
    id: "h3",
    title: "Canárias",
    cover: px(33843300),
    stories: {
      id: "h3s",
      title: "Canárias",
      images: [px(33843300), px(1606618), px(13282199)],
      times: ["6 sem", "6 sem", "6 sem"],
    },
  },
  {
    id: "h4",
    title: "Cafés",
    cover: px(34644109),
    stories: {
      id: "h4s",
      title: "Cafés",
      images: [px(34644109), px(32350985), px(33089293), px(20677077)],
      times: ["4 sem", "4 sem", "4 sem", "4 sem"],
    },
  },
  {
    id: "h5",
    title: "Bastidores",
    cover: px(16135656),
    stories: {
      id: "h5s",
      title: "Bastidores",
      images: [px(16135656), px(15872890), px(16459045)],
      times: ["2 sem", "2 sem", "2 sem"],
    },
  },
];

export const demoProfiles = [
  { username: "luiza.viajante", fullName: "Luiza Martins", avatar: av(44) },
  { username: "pedro.fotografa", fullName: "Pedro Henrique", avatar: av(12) },
  { username: "cafecombia", fullName: "Beatriz Lima", avatar: av(32) },
  { username: "gui.trilhas", fullName: "Guilherme Costa", avatar: av(15) },
  { username: "ana.lifestyle", fullName: "Ana Clara", avatar: av(47) },
];

export const demoFeedPosts: Post[] = posts.map((post, index) => {
  const author = demoProfiles[index % demoProfiles.length];
  return {
    ...post,
    id: `demo-${post.id}`,
    authorUsername: author.username,
    authorAvatar: author.avatar,
    type: "photo",
  };
});

export const demoStories: StorySet[] = highlights.map((highlight, index) => ({
  ...highlight.stories,
  id: `demo-${highlight.stories.id}`,
  title: demoProfiles[index % demoProfiles.length].username,
}));

export const formatNumber = (n: number) => n.toLocaleString("pt-BR");
