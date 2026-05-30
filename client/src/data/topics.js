import { dateInDays } from '../utils/topicHelpers';

export const INITIAL_TOPICS = [
  // Bases de datos (subjectId: 1)
  { id: 1,  subjectId: 1, name: 'T01 — Introducción BD',      reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 2,  subjectId: 1, name: 'T02 — Modelo E/R',           reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(5)   },
  { id: 3,  subjectId: 1, name: 'T03 — Normalización',        reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(0)   },
  { id: 4,  subjectId: 1, name: 'T04 — SQL Básico',           reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 5,  subjectId: 1, name: 'T05 — SQL Joins',            reviewCount: 1, reviewsNeeded: 4, nextReviewDate: dateInDays(3)   },
  { id: 6,  subjectId: 1, name: 'T06 — SQL Avanzado',         reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(2)   },
  // Lenguajes de marcas (subjectId: 2)
  { id: 7,  subjectId: 2, name: 'T01 — HTML',                 reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 8,  subjectId: 2, name: 'T02 — CSS',                  reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 9,  subjectId: 2, name: 'T03 — XML Validación',       reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 10, subjectId: 2, name: 'T04 — XSLT / XPath',         reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(0)   },
  { id: 11, subjectId: 2, name: 'T05 — XQuery',               reviewCount: 1, reviewsNeeded: 4, nextReviewDate: dateInDays(3)   },
  // Sistemas informáticos (subjectId: 3)
  { id: 12, subjectId: 3, name: 'T01 — Introducción SO',      reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 13, subjectId: 3, name: 'T02 — SO Historia',          reviewCount: 3, reviewsNeeded: 4, nextReviewDate: dateInDays(42)  },
  { id: 14, subjectId: 3, name: 'T03 — Boot/Virtualización',  reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(5)   },
  { id: 15, subjectId: 3, name: 'T04 — Windows',              reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(-2)  },
  { id: 16, subjectId: 3, name: 'T05 — Linux',                reviewCount: 1, reviewsNeeded: 4, nextReviewDate: dateInDays(1)   },
  // Entornos de desarrollo (subjectId: 4)
  { id: 17, subjectId: 4, name: 'T01 — IDEs',                 reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 18, subjectId: 4, name: 'T02 — Compilación',          reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 19, subjectId: 4, name: 'T03 — Debugger/Testing',     reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(4)   },
  { id: 20, subjectId: 4, name: 'T04 — Git / GitHub',         reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(2)   },
  // IPE (subjectId: 5)
  { id: 21, subjectId: 5, name: 'T01 — PRL Principios',       reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 22, subjectId: 5, name: 'T02 — PRL Riesgos',          reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 23, subjectId: 5, name: 'T03 — Primeros auxilios',    reviewCount: 4, reviewsNeeded: 4, nextReviewDate: null            },
  { id: 24, subjectId: 5, name: 'T04 — Relaciones laborales', reviewCount: 2, reviewsNeeded: 4, nextReviewDate: dateInDays(5)   },
];

export const MOCK_STATS = {
  streak: 5,
  totalRepasos: 47,
  overdue: 1,
  diffDistribution: { easy: 26, normal: 14, hard: 7 },
  chart7: [3, 2, 4, 1, 3, 0, 2],
  chart7Labels: ['Hoy', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  chart30: [3,0,2,4,1,0,0,3,2,1,4,0,0,2,3,1,0,0,4,2,1,3,0,0,2,4,1,0,3,2],
  asigProgress: [
    { name: 'Bases de datos',         color: '#4d9fff', done: 2, total: 6 },
    { name: 'Lenguajes de marcas',    color: '#c8fb4e', done: 3, total: 5 },
    { name: 'Sistemas informáticos',  color: '#9b6dff', done: 1, total: 5 },
    { name: 'Entornos de desarrollo', color: '#ff4d4d', done: 2, total: 4 },
    { name: 'IPE',                    color: '#f5a623', done: 3, total: 4 },
  ],
  activity: [0,1,2,3,4,2,1, 3,4,2,0,1,3,2, 4,3,1,2,4,3,0, 1,2,3,4,2,1,3, 4,3,2,1,0,2,4],
  weakSpots: [
    { name: 'SI T2 — CTSS primera OS multiusuario',  tag: 'Difícil ×3' },
    { name: 'IPE T3 — Umbral 250-500 trabajadores',  tag: 'Difícil ×2' },
    { name: 'LMSGI T4 — xsl:sort position',          tag: 'Difícil ×2' },
  ],
  atRisk: [
    { name: 'BD T2 — Modelo E/R',       tag: 'Score 73%' },
    { name: 'ED T3 — Debugger Eclipse', tag: 'Score 70%' },
    { name: 'IPE T1 — Art. 15 LPRL',   tag: 'Score 68%' },
  ],
};

export const MOCK_EXAMS = [
  { id: 1, subjectId: 1, name: 'Parcial BD',   date: new Date(Date.now() + 8  * 86400000) },
  { id: 2, subjectId: 3, name: 'Examen SI',    date: new Date(Date.now() + 15 * 86400000) },
  { id: 3, subjectId: 2, name: 'Final LMSGI',  date: new Date(Date.now() + 23 * 86400000) },
  { id: 4, subjectId: 4, name: 'Prácticas ED', date: new Date(Date.now() + 37 * 86400000) },
];
