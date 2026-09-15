import { connectDb } from '../infrastructure/config/db';
import { repos } from '../infrastructure/composition';
import { BcryptPasswordHasher } from '../infrastructure/security/password.service';

const SECTIONS = ['books', 'users', 'roles', 'permissions', 'orders', 'reviews', 'reports', 'discounts'] as const;
const CRUD = ['create', 'read', 'update', 'delete'] as const;

function basePermissions() {
  const perms: { slug: string; name: string; description: string; section: string }[] = [];

  for (const section of SECTIONS) {
    for (const action of CRUD) {
      perms.push({
        slug: `${section}:${action}`,
        name: `${section} ${action}`,
        description: `Can ${action} ${section}`,
        section,
      });
    }
  }

  const extras = [
    { slug: 'orders:read-own', name: 'orders read own', description: 'Read own orders', section: 'orders' },
    { slug: 'orders:update-status', name: 'orders update status', description: 'Update order status', section: 'orders' },
    { slug: 'reviews:update-own', name: 'reviews update own', description: 'Update own reviews', section: 'reviews' },
    { slug: 'reviews:delete-own', name: 'reviews delete own', description: 'Delete own reviews', section: 'reviews' },
    { slug: 'users:read-own', name: 'users read own', description: 'Read own profile', section: 'users' },
    { slug: 'users:update-own', name: 'users update own', description: 'Update own profile', section: 'users' },
    { slug: 'reports:analytics', name: 'reports analytics', description: 'View analytics', section: 'reports' },
    { slug: 'reports:manage', name: 'reports manage', description: 'Manage issue reports', section: 'reports' },
    { slug: 'reports:issues:create', name: 'reports issues create', description: 'Create issue reports', section: 'reports' },
    { slug: 'admin:dashboard', name: 'admin dashboard', description: 'Access admin dashboard endpoints', section: 'admin' },
  ];

  return [...perms, ...extras];
}

const CUSTOMER_SLUGS = [
  'books:read',
  'orders:create',
  'orders:read-own',
  'reviews:create',
  'reviews:read',
  'reviews:update-own',
  'reviews:delete-own',
  'reports:issues:create',
  'users:read-own',
  'users:update-own',
];

function coverUrl(isbn: string): string {
  const clean = isbn.replace(/-/g, '');
  return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`;
}

/** 40 distinct books with real/public ISBNs for Open Library covers */
const FEATURED_ISBNS = new Set([
  '9780201616224', // The Pragmatic Programmer
  '9780132350884', // Clean Code
  '9781449373320', // DDIA
  '9780062316097', // Sapiens
  '9780547928227', // The Hobbit
  '9780441172719', // Dune
]);

const SEED_BOOKS: {
  title: string;
  author: string;
  description: string;
  isbn: string;
  price: number;
  stock: number;
  categories: string[];
}[] = [
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    description: 'Classic guide to software craftsmanship and pragmatic practices.',
    isbn: '9780201616224',
    price: 42.99,
    stock: 25,
    categories: ['programming', 'software'],
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'A handbook of agile software craftsmanship.',
    isbn: '9780132350884',
    price: 37.5,
    stock: 40,
    categories: ['programming'],
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    description: 'The big ideas behind reliable, scalable, and maintainable systems.',
    isbn: '9781449373320',
    price: 49.99,
    stock: 15,
    categories: ['data', 'architecture'],
  },
  {
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    description: 'A craftsman’s guide to software structure and design.',
    isbn: '9780134494166',
    price: 39.99,
    stock: 22,
    categories: ['architecture', 'programming'],
  },
  {
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    description: 'Tackling complexity in the heart of software.',
    isbn: '9780321125217',
    price: 54.99,
    stock: 12,
    categories: ['architecture', 'ddd'],
  },
  {
    title: 'Refactoring',
    author: 'Martin Fowler',
    description: 'Improving the design of existing code.',
    isbn: '9780134757599',
    price: 47.99,
    stock: 18,
    categories: ['programming'],
  },
  {
    title: 'You Don’t Know JS Yet: Get Started',
    author: 'Kyle Simpson',
    description: 'Deep dive into JavaScript fundamentals.',
    isbn: '9781098124038',
    price: 29.99,
    stock: 30,
    categories: ['javascript', 'programming'],
  },
  {
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    description: 'A modern introduction to programming with JavaScript.',
    isbn: '9781593279509',
    price: 34.99,
    stock: 28,
    categories: ['javascript', 'programming'],
  },
  {
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    description: 'Unearthing the excellence in JavaScript.',
    isbn: '9780596517748',
    price: 27.99,
    stock: 20,
    categories: ['javascript'],
  },
  {
    title: 'Head First Design Patterns',
    author: 'Eric Freeman, Elisabeth Robson',
    description: 'A brain-friendly guide to design patterns.',
    isbn: '9780596007126',
    price: 44.99,
    stock: 16,
    categories: ['design-patterns', 'programming'],
  },
  {
    title: 'Effective Java',
    author: 'Joshua Bloch',
    description: 'Best practices for the Java platform.',
    isbn: '9780134685991',
    price: 46.99,
    stock: 14,
    categories: ['java', 'programming'],
  },
  {
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    description: 'The definitive guide to C by its creators.',
    isbn: '9780131103627',
    price: 52.0,
    stock: 10,
    categories: ['c', 'programming'],
  },
  {
    title: 'Grokking Algorithms',
    author: 'Aditya Bhargava',
    description: 'An illustrated guide for programmers and other curious people.',
    isbn: '9781617292231',
    price: 36.99,
    stock: 35,
    categories: ['algorithms', 'programming'],
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen et al.',
    description: 'Comprehensive textbook on algorithms (CLRS).',
    isbn: '9780262033848',
    price: 89.99,
    stock: 8,
    categories: ['algorithms'],
  },
  {
    title: 'Building Microservices',
    author: 'Sam Newman',
    description: 'Designing fine-grained systems.',
    isbn: '9781492034025',
    price: 48.99,
    stock: 17,
    categories: ['architecture', 'microservices'],
  },
  {
    title: 'Site Reliability Engineering',
    author: 'Betsy Beyer et al.',
    description: 'How Google runs production systems.',
    isbn: '9781491929124',
    price: 49.99,
    stock: 11,
    categories: ['sre', 'devops'],
  },
  {
    title: 'The Phoenix Project',
    author: 'Gene Kim, Kevin Behr, George Spafford',
    description: 'A novel about IT, DevOps, and helping your business win.',
    isbn: '9780988262591',
    price: 24.99,
    stock: 40,
    categories: ['devops', 'business'],
  },
  {
    title: 'Accelerate',
    author: 'Nicole Forsgren, Jez Humble, Gene Kim',
    description: 'The science of lean software and DevOps.',
    isbn: '9781942788331',
    price: 27.99,
    stock: 22,
    categories: ['devops', 'management'],
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A brief history of humankind.',
    isbn: '9780062316097',
    price: 22.99,
    stock: 50,
    categories: ['history', 'nonfiction'],
  },
  {
    title: 'Homo Deus',
    author: 'Yuval Noah Harari',
    description: 'A brief history of tomorrow.',
    isbn: '9780062464316',
    price: 23.99,
    stock: 32,
    categories: ['history', 'nonfiction'],
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    description: 'From the Big Bang to black holes.',
    isbn: '9780553380163',
    price: 18.99,
    stock: 27,
    categories: ['science', 'physics'],
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'A fable about following your dream.',
    isbn: '9780062315007',
    price: 16.99,
    stock: 60,
    categories: ['fiction', 'philosophy'],
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'Dystopian classic of surveillance and totalitarianism.',
    isbn: '9780451524935',
    price: 12.99,
    stock: 45,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'Animal Farm',
    author: 'George Orwell',
    description: 'A satirical allegory of revolution and power.',
    isbn: '9780451526342',
    price: 11.99,
    stock: 48,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A powerful story of racial injustice and childhood.',
    isbn: '9780061120084',
    price: 14.99,
    stock: 38,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'Jazz Age tale of wealth, love, and the American Dream.',
    isbn: '9780743273565',
    price: 13.99,
    stock: 42,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'Witty romance and social commentary in Regency England.',
    isbn: '9780141439518',
    price: 10.99,
    stock: 55,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    description: 'An orphan’s journey to independence and love.',
    isbn: '9780141441146',
    price: 11.49,
    stock: 33,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'Frankenstein',
    author: 'Mary Shelley',
    description: 'The modern Prometheus — gothic science fiction classic.',
    isbn: '9780141439471',
    price: 10.49,
    stock: 29,
    categories: ['fiction', 'classics', 'horror'],
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    description: 'The definitive vampire novel.',
    isbn: '9780141439846',
    price: 11.99,
    stock: 26,
    categories: ['fiction', 'classics', 'horror'],
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'Bilbo Baggins’ unexpected journey.',
    isbn: '9780547928227',
    price: 15.99,
    stock: 44,
    categories: ['fantasy', 'fiction'],
  },
  {
    title: 'The Fellowship of the Ring',
    author: 'J.R.R. Tolkien',
    description: 'Book one of The Lord of the Rings.',
    isbn: '9780547928210',
    price: 16.99,
    stock: 36,
    categories: ['fantasy', 'fiction'],
  },
  {
    title: 'Harry Potter and the Sorcerer’s Stone',
    author: 'J.K. Rowling',
    description: 'The beginning of the Harry Potter series.',
    isbn: '9780590353427',
    price: 14.99,
    stock: 70,
    categories: ['fantasy', 'young-adult'],
  },
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    description: 'Harry’s second year at Hogwarts.',
    isbn: '9780439064873',
    price: 14.99,
    stock: 65,
    categories: ['fantasy', 'young-adult'],
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    description: 'A future where books are outlawed and burned.',
    isbn: '9781451673319',
    price: 13.49,
    stock: 31,
    categories: ['fiction', 'classics', 'dystopia'],
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    description: 'A chilling vision of a controlled utopian society.',
    isbn: '9780060850524',
    price: 14.49,
    stock: 28,
    categories: ['fiction', 'classics', 'dystopia'],
  },
  {
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    description: 'Psychological masterpiece of guilt and redemption.',
    isbn: '9780140449136',
    price: 12.99,
    stock: 19,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'Holden Caulfield’s coming-of-age narrative.',
    isbn: '9780316769488',
    price: 13.99,
    stock: 34,
    categories: ['fiction', 'classics'],
  },
  {
    title: 'Ready Player One',
    author: 'Ernest Cline',
    description: 'A treasure hunt inside a virtual reality utopia.',
    isbn: '9780307887443',
    price: 15.99,
    stock: 41,
    categories: ['fiction', 'sci-fi'],
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'Epic science fiction on the desert planet Arrakis.',
    isbn: '9780441172719',
    price: 17.99,
    stock: 37,
    categories: ['fiction', 'sci-fi'],
  },
];

export type SeedOptions = {
  /** When true, seed only a handful of books (for automated tests). */
  minimalBooks?: boolean;
};

export async function runSeed(options: SeedOptions = {}): Promise<void> {
  const passwordHasher = new BcryptPasswordHasher();

  const defs = basePermissions();
  for (const def of defs) {
    await repos.permissions.upsertBySlug(def.slug, def);
  }
  const allPerms = await repos.permissions.list();

  const adminRole = await repos.roles.upsertByName('admin', {
    name: 'admin',
    description: 'Full access',
    permissions: allPerms.map((p) => p.id),
  });

  const customerPermIds = allPerms
    .filter((p) => CUSTOMER_SLUGS.includes(p.slug))
    .map((p) => p.id);
  await repos.roles.upsertByName('customer', {
    name: 'customer',
    description: 'Default customer role',
    permissions: customerPermIds,
  });

  const passwordHash = await passwordHasher.hash('Admin123!');
  const existingAdmin = await repos.users.findByEmail('admin@bookstore.local');
  if (existingAdmin) {
    await repos.users.update(existingAdmin.id, {
      name: 'Admin',
      passwordHash,
      roles: [adminRole.id],
      isActive: true,
    });
  } else {
    await repos.users.create({
      name: 'Admin',
      email: 'admin@bookstore.local',
      passwordHash,
      roles: [adminRole.id],
      isActive: true,
    });
  }

  const booksToSeed = options.minimalBooks ? SEED_BOOKS.slice(0, 5) : SEED_BOOKS;
  if (!options.minimalBooks && SEED_BOOKS.length !== 40) {
    throw new Error(`Expected exactly 40 seed books, got ${SEED_BOOKS.length}`);
  }

  let featuredOrder = 1;
  for (const b of booksToSeed) {
    const featured = FEATURED_ISBNS.has(b.isbn);
    await repos.books.upsertByIsbn(b.isbn, {
      ...b,
      coverImageUrl: coverUrl(b.isbn),
      currency: 'USD',
      featured,
      featuredOrder: featured ? featuredOrder++ : 0,
    });
  }

  const sampleDiscounts = [
    {
      code: 'WELCOME10',
      type: 'percent' as const,
      value: 10,
      minOrderAmount: 20,
      maxUses: 1000,
      isActive: true,
    },
    {
      code: 'FLAT5',
      type: 'fixed' as const,
      value: 5,
      minOrderAmount: 15,
      maxUses: 500,
      isActive: true,
    },
  ];
  for (const d of sampleDiscounts) {
    const existing = await repos.discounts.findByCode(d.code);
    if (!existing) {
      await repos.discounts.create(d);
    }
  }
}

async function main() {
  await connectDb();
  console.log('Seeding...');
  await runSeed();
  const bookCount = await repos.books.count();
  console.log(`Books upserted (catalog count: ${bookCount}); featured: ${FEATURED_ISBNS.size}`);
  console.log('Admin user: admin@bookstore.local / Admin123!');
  console.log('Sample discounts: WELCOME10 (10%), FLAT5 ($5)');
  console.log('Seed complete.');
  process.exit(0);
}

// Only auto-run when executed as CLI (`npm run seed` / `tsx src/scripts/seed.ts`)
const isCli =
  typeof process.argv[1] === 'string' &&
  (process.argv[1].endsWith('scripts/seed.ts') || process.argv[1].endsWith('scripts/seed.js'));

if (isCli) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
