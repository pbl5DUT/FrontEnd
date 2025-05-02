// import { count } from 'console';
import {
  Category,
  Article,
  ArticleComment,
  ArticleReaction,
  ReactionType,
  UserFavorite,
} from '../types/knowledge';
import { v4 as uuidv4 } from 'uuid';

// Dữ liệu giả cho các danh mục
export const mockCategories: Category[] = [
  {
    id: 'category-1',
    name: 'Hướng dẫn kỹ thuật',
    description: 'Các bài viết hướng dẫn kỹ thuật',
    iconUrl: '/assets/icons/technical.png',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05'),
    articleCount: 4,
  },
  {
    id: 'category-2',
    name: 'Quy trình làm việc',
    description: 'Các quy trình làm việc chuẩn',
    iconUrl: '/assets/icons/workflow.png',
    createdBy: 'user-2',
    createdAt: new Date('2023-01-08'),
    updatedAt: new Date('2023-01-08'),
    articleCount: 3,
  },
  {
    id: 'category-3',
    name: 'Best Practices',
    description: 'Những phương pháp tốt nhất',
    iconUrl: '/assets/icons/best-practices.png',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-12'),
    updatedAt: new Date('2023-01-12'),
    articleCount: 5,
  },
  {
    id: 'category-4',
    name: 'Giải pháp lỗi phổ biến',
    description: 'Hướng dẫn giải quyết các lỗi thường gặp',
    iconUrl: '/assets/icons/troubleshooting.png',
    createdBy: 'user-3',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    articleCount: 6,
  },
  {
    id: 'category-5',
    name: 'Công nghệ mới',
    description: 'Thông tin về các công nghệ mới',
    iconUrl: '/assets/icons/new-tech.png',
    createdBy: 'user-2',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
    articleCount: 2,
  },
  {
    id: 'category-6',
    name: 'JavaScript',
    description: 'Kiến thức về JavaScript',
    iconUrl: '/assets/icons/javascript.png',
    parentId: 'category-1',
    createdBy: 'user-1',
    createdAt: new Date('2023-01-22'),
    updatedAt: new Date('2023-01-22'),
    articleCount: 3,
  },
  {
    id: 'category-7',
    name: 'React',
    description: 'Kiến thức về React',
    iconUrl: '/assets/icons/react.png',
    parentId: 'category-1',
    createdBy: 'user-2',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
    articleCount: 4,
  },
];

// Dữ liệu giả cho các bài viết
export const mockArticles: Article[] = [
  {
    id: 'article-1',
    title: 'Cách sử dụng Hooks trong React',
    content: `# Cách sử dụng Hooks trong React

## Giới thiệu

React Hooks là tính năng được giới thiệu trong React 16.8, cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class. Hooks giúp code trở nên dễ đọc, dễ kiểm tra và dễ tái sử dụng hơn.

## Các Hook cơ bản

### 1. useState

\`useState\` là hook cơ bản nhất, cho phép bạn thêm state vào functional component:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Bạn đã click {count} lần</p>
      <button onClick={() => setCount(count + 1)}>
        Click tăng
      </button>
    </div>
  );
}
\`\`\`

### 2. useEffect

\`useEffect\` cho phép bạn thực hiện các side effects trong functional component, tương tự như componentDidMount, componentDidUpdate, và componentWillUnmount:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Tương tự componentDidMount và componentDidUpdate:
  useEffect(() => {
    document.title = \`Bạn đã click lần\`;
    
    // Cleanup function (tương tự componentWillUnmount):
    return () => {
      document.title = 'React App';
    };
  }, [count]); // Chỉ re-run effect nếu count thay đổi

  return (
    <div>
      <p>Bạn đã click {count} lần</p>
      <button onClick={() => setCount(count + 1)}>
        Click tăng
      </button>
    </div>
  );
}
\`\`\`

### 3. useContext

\`useContext\` giúp bạn sử dụng Context API dễ dàng hơn:

\`\`\`jsx
import React, { useContext } from 'react';

const ThemeContext = React.createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Nút theo chủ đề</button>;
}
\`\`\`

## Custom Hooks

Bạn có thể tạo custom hooks để tái sử dụng logic giữa các components:

\`\`\`jsx
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set kích thước ban đầu
    
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Chỉ chạy một lần khi component mount

  return windowSize;
}
\`\`\`

## Quy tắc khi sử dụng Hooks

1. **Chỉ gọi Hooks ở cấp cao nhất** - Không gọi hooks trong loops, conditions, hoặc nested functions
2. **Chỉ gọi Hooks từ React functions** - Gọi hooks từ React functional components hoặc từ custom hooks

## Kết luận

Hooks giúp bạn tạo ra các components dễ đọc, tái sử dụng, và test. Hãy sử dụng hooks thay cho class components khi có thể để tận dụng các ưu điểm này.`,
    summary:
      'Hướng dẫn cách sử dụng React Hooks hiệu quả với các ví dụ thực tế.',
    categoryId: 'category-7',
    tags: ['react', 'hooks', 'javascript', 'frontend'],
    createdBy: 'user-1',
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-10'),
    viewCount: 542,
    likeCount: 35,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'article-2',
    title: 'Quy trình Code Review hiệu quả',
    content: `# Quy trình Code Review hiệu quả

## Tầm quan trọng của Code Review

Code review là quá trình kiểm tra code của đồng nghiệp trước khi merge vào codebase chính. Quá trình này giúp:
- Phát hiện lỗi sớm
- Đảm bảo chất lượng code
- Chia sẻ kiến thức trong team
- Đảm bảo tuân thủ quy chuẩn

## Quy trình Code Review

### 1. Chuẩn bị trước khi gửi code để review

#### Người gửi code:
- Kiểm tra xem code có đáp ứng yêu cầu không
- Viết tests đầy đủ và đảm bảo tất cả tests pass
- Đảm bảo code tuân thủ các quy chuẩn của dự án
- Tự review code của mình trước
- Cung cấp mô tả pull request chi tiết

### 2. Quá trình review code

#### Người review:
- Đọc mô tả pull request để hiểu mục đích thay đổi
- Kiểm tra xem code có đáp ứng yêu cầu không
- Đảm bảo code có thể bảo trì được
- Kiểm tra có security issues không
- Đánh giá performance

### 3. Phản hồi

#### Khi đưa ra feedback:
- Lịch sự và tôn trọng
- Tập trung vào code, không phải người viết code
- Giải thích lý do cho các đề xuất thay đổi
- Sử dụng các câu hỏi thay vì mệnh lệnh
- Phân biệt rõ giữa các yêu cầu bắt buộc và đề xuất

#### Người nhận feedback:
- Không coi feedback là chỉ trích cá nhân
- Giải thích rõ các quyết định khi cần thiết
- Thảo luận một cách cởi mở
- Đừng bảo vệ code của mình quá mức

### 4. Resolve và Merge

- Giải quyết tất cả các comments
- Sau khi đã giải quyết và được approve, có thể merge code

## Best Practices

1. **Giới hạn kích thước pull request**: 
   Pull request nhỏ dễ review hơn. Nên giữ dưới 400 dòng thay đổi nếu có thể.

2. **Review thường xuyên**:
   Đừng để pull requests tồn đọng quá lâu. Nên review trong vòng 24 giờ.

3. **Sử dụng checklist**:
   Tạo checklist để đảm bảo mọi điểm quan trọng đều được kiểm tra.

4. **Tự động hóa khi có thể**:
   Sử dụng các công cụ linting, static analysis để giảm tải cho reviewers.

5. **Pair programming**:
   Đôi khi pair programming có thể thay thế hoặc bổ sung cho code reviews.

## Kết luận

Code review là một quá trình rất quan trọng, nhưng chỉ hiệu quả khi được thực hiện đúng cách. Với những hướng dẫn trên, hy vọng team của bạn sẽ có được quy trình code review hiệu quả và xây dựng được codebase chất lượng cao.`,
    summary:
      'Quy trình và hướng dẫn chi tiết để thực hiện code review hiệu quả trong team phát triển phần mềm.',
    categoryId: 'category-2',
    tags: ['code review', 'best practices', 'team work', 'development process'],
    createdBy: 'user-2',
    createdAt: new Date('2023-02-08'),
    updatedAt: new Date('2023-02-15'),
    viewCount: 478,
    likeCount: 42,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'article-3',
    title: 'Giải quyết lỗi memory leak trong React',
    content: `# Giải quyết lỗi memory leak trong React

## Memory leak là gì?

Memory leak (rò rỉ bộ nhớ) xảy ra khi ứng dụng của bạn không giải phóng bộ nhớ đã không còn được sử dụng. Trong React, memory leaks thường xảy ra khi components đã unmount nhưng vẫn có các subscriptions hoặc callbacks đang chạy.

## Các nguyên nhân phổ biến gây memory leak trong React

### 1. Quên cleanup trong useEffect

Đây là nguyên nhân phổ biến nhất. Khi bạn thiết lập các subscriptions, event listeners, hoặc các tác vụ bất đồng bộ trong useEffect, bạn cần phải cleanup chúng khi component unmount:

\`\`\`jsx
useEffect(() => {
  const subscription = someAPI.subscribe();
  
  // Sai: Không có cleanup
  
}, []);
\`\`\`

### 2. SetState sau khi component unmounted

Một lỗi phổ biến khác là cố gắng cập nhật state sau khi component đã unmount:

\`\`\`jsx
useEffect(() => {
  fetchData().then(data => {
    // Có thể gây lỗi nếu component đã unmount trước khi API trả về
    setData(data);
  });
}, []);
\`\`\`

### 3. Global event listeners không được xóa

\`\`\`jsx
useEffect(() => {
  window.addEventListener('resize', handleResize);
  
  // Sai: Không xóa event listener
}, []);
\`\`\`

## Cách phòng tránh memory leaks

### 1. Luôn cleanup trong useEffect

\`\`\`jsx
useEffect(() => {
  const subscription = someAPI.subscribe();
  
  // Đúng: Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
\`\`\`

### 2. Sử dụng AbortController cho fetch requests

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;
  
  fetch('/api/data', { signal })
    .then(response => response.json())
    .then(data => {
      setData(data);
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    });
  
  return () => {
    controller.abort();
  };
}, []);
\`\`\`

### 3. Sử dụng flag để kiểm tra component còn mounted không

\`\`\`jsx
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) {
      setData(data);
    }
  });
  
  return () => {
    isMounted = false;
  };
}, []);
\`\`\`

### 4. Xóa global event listeners

\`\`\`jsx
useEffect(() => {
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
\`\`\`

## Công cụ phát hiện memory leaks

1. **React DevTools Profiler**: Giúp phân tích performance và có thể phát hiện renders không cần thiết.

2. **Chrome DevTools Memory tab**: Chụp và so sánh các memory snapshots để phát hiện memory leaks.

3. **Công cụ why-did-you-render**: Thư viện giúp phát hiện re-renders không cần thiết.

## Tóm lại

Memory leaks có thể gây ra các vấn đề nghiêm trọng về performance trong ứng dụng React. Luôn nhớ:

1. Cleanup tất cả các subscriptions, timers, và event listeners
2. Hủy các network requests khi component unmount
3. Kiểm tra component có còn mounted không trước khi update state
4. Sử dụng các công cụ kiểm tra memory để phát hiện và giải quyết leaks

Tuân thủ các nguyên tắc này sẽ giúp ứng dụng của bạn chạy mượt mà và sử dụng bộ nhớ hiệu quả.`,
    summary: 'Hướng dẫn nhận diện và xử lý memory leak trong ứng dụng React',
    categoryId: 'category-4',
    tags: ['react', 'debugging', 'performance', 'memory leak'],
    createdBy: 'user-1',
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-02-20'),
    viewCount: 621,
    likeCount: 53,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: 'article-4',
    title: 'Tips viết Unit Test hiệu quả',
    content: `# Tips viết Unit Test hiệu quả

## Tại sao cần Unit Test?

Unit testing là việc kiểm tra các thành phần riêng lẻ của code (units) để đảm bảo chúng hoạt động đúng. Lợi ích chính của unit testing bao gồm:

- Phát hiện lỗi sớm
- Tạo tài liệu "sống" về cách code hoạt động
- Cho phép refactoring an toàn
- Cải thiện thiết kế code

## Nguyên tắc FIRST

Một unit test tốt nên tuân theo nguyên tắc FIRST:

- **F**ast: Test nhanh để có thể chạy thường xuyên
- **I**solated: Test độc lập, không phụ thuộc vào test khác
- **R**epeatable: Kết quả nhất quán qua mỗi lần chạy
- **S**elf-validating: Tự xác nhận thành công/thất bại
- **T**imely: Viết test đúng thời điểm (tốt nhất là trước khi viết code - TDD)

## Cấu trúc test: AAA pattern

Mỗi unit test nên theo cấu trúc AAA (Arrange-Act-Assert):

\`\`\`javascript
// Arrange: Chuẩn bị dữ liệu và điều kiện cho test
const userService = new UserService();
const mockUserData = { id: 1, name: 'Test User' };

// Act: Thực hiện hành động cần test
const result = userService.createUser(mockUserData);

// Assert: Kiểm tra kết quả
expect(result).toHaveProperty('id');
expect(result.name).toBe('Test User');
\`\`\`

## 10 tips viết unit test hiệu quả

### 1. Test một hành vi cụ thể trong mỗi test case

Mỗi test nên tập trung vào một hành vi duy nhất. Điều này giúp xác định rõ ràng vấn đề khi test thất bại.

\`\`\`javascript
// Không tốt: Test nhiều hành vi
test('createUser handles all cases', () => {
  // Test tạo user thành công
  // Test xử lý lỗi
  // Test validate dữ liệu
});

// Tốt: Mỗi test một hành vi
test('createUser returns user with ID when successful', () => {
  // Test tạo user thành công
});

test('createUser throws error when validation fails', () => {
  // Test validate dữ liệu
});
\`\`\`

### 2. Đặt tên test mô tả hành vi cần test

\`\`\`javascript
// Không rõ ràng
test('createUser test', () => {});

// Rõ ràng
test('createUser returns user with generated ID when name is provided', () => {});
\`\`\`

### 3. Sử dụng test doubles (mocks, stubs) hợp lý

Sử dụng mocks khi cần kiểm tra tương tác, stubs khi cần cung cấp dữ liệu cụ thể.

\`\`\`javascript
// Sử dụng mock để kiểm tra tương tác
test('sendWelcomeEmail calls emailService', () => {
  const emailServiceMock = {
    sendEmail: jest.fn(),
  };
  
  const userService = new UserService(emailServiceMock);
  userService.createUser({ name: 'Test' });
  
  expect(emailServiceMock.sendEmail).toHaveBeenCalled();
});
\`\`\`

### 4. Tránh test triển khai, hãy test hành vi

Test nên tập trung vào đầu vào và đầu ra, không phải cách thức triển khai bên trong.

### 5. Giữ test đơn giản và dễ đọc

Test phức tạp thường chứa bug và khó bảo trì.

### 6. Tránh logic điều kiện trong test

Nếu bạn cần if/else trong test, có thể bạn cần chia thành nhiều test case.

### 7. Sử dụng factories và builders cho test data

\`\`\`javascript
// Helper function tạo test data
function createTestUser(overrides = {}) {
  return {
    id: 1,
    name: 'Default Name',
    email: 'test@example.com',
    ...overrides
  };
}

test('updateUser updates name', () => {
  const user = createTestUser();
  const updates = { name: 'New Name' };
  
  userService.updateUser(user.id, updates);
  
  const updated = userService.getUser(user.id);
  expect(updated.name).toBe('New Name');
});
\`\`\`

### 8. Test cả happy path và error cases

Đừng chỉ test trường hợp thành công, hãy test cả các trường hợp lỗi.

### 9. Kiểm tra code coverage nhưng không quá tập trung

Coverage 100% không đảm bảo không có bug. Tập trung vào test chất lượng hơn là số lượng.

### 10. Chạy test thường xuyên

Test chỉ có giá trị khi được chạy. Tích hợp vào CI/CD pipeline để đảm bảo test luôn được chạy.

## Kết luận

Unit testing là kỹ năng quan trọng cho mọi developer. Viết test tốt không chỉ giúp code ít bug hơn mà còn cải thiện chất lượng code và tốc độ phát triển dài hạn.`,
    summary:
      'Các nguyên tắc và mẹo để viết unit test hiệu quả với ví dụ cụ thể',
    categoryId: 'category-3',
    tags: ['testing', 'unit test', 'best practices', 'TDD'],
    createdBy: 'user-3',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-02-22'),
    viewCount: 382,
    likeCount: 29,
    isFeatured: false,
    isPublished: true,
  },
];

// Dữ liệu giả cho các bình luận
export const mockComments: ArticleComment[] = [
  {
    id: 'comment-1',
    articleId: 'article-1',
    content:
      'Bài viết rất hữu ích. Tôi đã áp dụng hooks trong dự án và thấy code gọn gàng hơn nhiều.',
    userId: 'user-2',
    createdAt: new Date('2023-02-06'),
    updatedAt: new Date('2023-02-06'),
  },
  {
    id: 'comment-2',
    articleId: 'article-1',
    content:
      'Phần custom hooks giúp tôi hiểu rõ hơn cách tái sử dụng logic. Cảm ơn bạn!',
    userId: 'user-3',
    createdAt: new Date('2023-02-08'),
    updatedAt: new Date('2023-02-08'),
  },
  {
    id: 'comment-3',
    articleId: 'article-2',
    content:
      'Quy trình rất chi tiết. Đội của tôi đang áp dụng và hiệu quả hơn rất nhiều!',
    userId: 'user-1',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10'),
  },
  {
    id: 'comment-4',
    parentId: 'comment-3',
    articleId: 'article-2',
    content: 'Bạn có thể chia sẻ thêm về cách team của bạn áp dụng được không?',
    userId: 'user-2',
    createdAt: new Date('2023-02-11'),
    updatedAt: new Date('2023-02-11'),
  },
];

// Dữ liệu giả cho các phản ứng
export const mockReactions: ArticleReaction[] = [
  {
    id: 'reaction-1',
    articleId: 'article-1',
    userId: 'user-2',
    reactionType: ReactionType.LIKE,
    createdAt: new Date('2023-02-07'),
  },
  {
    id: 'reaction-2',
    articleId: 'article-1',
    userId: 'user-3',
    reactionType: ReactionType.HELPFUL,
    createdAt: new Date('2023-02-08'),
  },
  {
    id: 'reaction-3',
    articleId: 'article-2',
    userId: 'user-1',
    reactionType: ReactionType.LIKE,
    createdAt: new Date('2023-02-12'),
  },
  {
    id: 'reaction-4',
    articleId: 'article-3',
    userId: 'user-2',
    reactionType: ReactionType.CONFUSED,
    createdAt: new Date('2023-02-18'),
  },
];

// Dữ liệu giả cho các bài viết yêu thích
export const mockFavorites: UserFavorite[] = [
  {
    id: 'favorite-1',
    userId: 'user-1',
    articleId: 'article-2',
    createdAt: new Date('2023-02-15'),
  },
  {
    id: 'favorite-2',
    userId: 'user-2',
    articleId: 'article-1',
    createdAt: new Date('2023-02-10'),
  },
  {
    id: 'favorite-3',
    userId: 'user-3',
    articleId: 'article-3',
    createdAt: new Date('2023-02-22'),
  },
];

// Dữ liệu giả về người dùng
export const mockUsers = [
  { id: 'user-1', name: 'Nguyễn Văn A' },
  { id: 'user-2', name: 'Trần Thị B' },
  { id: 'user-3', name: 'Lê Minh C' },
];

/**
 * Lấy danh sách tất cả các danh mục
 */
export const fetchCategories = async (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockCategories]);
    }, 500);
  });
};

/**
 * Lấy danh sách các bài viết theo danh mục
 */
export const fetchArticlesByCategory = async (
  categoryId?: string
): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredArticles = categoryId
        ? mockArticles.filter((article) => article.categoryId === categoryId)
        : mockArticles;
      resolve([...filteredArticles]);
    }, 500);
  });
};

/**
 * Lấy thông tin chi tiết về một bài viết
 */
export const fetchArticleById = async (
  articleId: string
): Promise<Article | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const article =
        mockArticles.find((article) => article.id === articleId) || null;
      resolve(article);
    }, 300);
  });
};
/**
 * Lấy danh sách bình luận về một bài viết
 */
export const fetchCommentsByArticle = async (
  articleId: string
): Promise<ArticleComment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredComments = mockComments.filter(
        (comment) => comment.articleId === articleId
      );
      resolve([...filteredComments]);
    }, 400);
  });
};

/**
 * Lấy danh sách các bài viết phổ biến nhất
 */
export const fetchPopularArticles = async (
  limit: number = 5
): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sortedArticles = [...mockArticles].sort(
        (a, b) => b.viewCount - a.viewCount
      );
      resolve(sortedArticles.slice(0, limit));
    }, 500);
  });
};

/**
 * Lấy danh sách các bài viết mới nhất
 */
export const fetchRecentArticles = async (
  limit: number = 5
): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sortedArticles = [...mockArticles].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(sortedArticles.slice(0, limit));
    }, 500);
  });
};

/**
 * Lấy danh sách các bài viết yêu thích của người dùng
 */
export const fetchFavoriteArticles = async (
  userId: string
): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userFavorites = mockFavorites.filter(
        (favorite) => favorite.userId === userId
      );
      const favoriteArticleIds = userFavorites.map(
        (favorite) => favorite.articleId
      );
      const articles = mockArticles.filter((article) =>
        favoriteArticleIds.includes(article.id)
      );
      resolve([...articles]);
    }, 500);
  });
};

/**
 * Tìm kiếm bài viết
 */
export const searchArticles = async (query: string): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase();
      const results = mockArticles.filter((article) => {
        return (
          article.title.toLowerCase().includes(normalizedQuery) ||
          (article.summary &&
            article.summary.toLowerCase().includes(normalizedQuery)) ||
          article.content.toLowerCase().includes(normalizedQuery) ||
          (article.tags &&
            article.tags.some((tag: string) =>
              tag.toLowerCase().includes(normalizedQuery)
            ))
        );
      });
      resolve([...results]);
    }, 600);
  });
};

/**
 * Thêm bình luận mới
 */
export const addComment = async (
  commentData: Partial<ArticleComment>
): Promise<ArticleComment> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newComment: ArticleComment = {
        id: uuidv4(),
        articleId: commentData.articleId || '',
        content: commentData.content || '',
        userId: commentData.userId || 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: commentData.parentId,
      };

      mockComments.push(newComment);
      resolve(newComment);
    }, 300);
  });
};

/**
 * Thêm/Xóa bài viết yêu thích
 */
export const toggleFavorite = async (
  userId: string,
  articleId: string
): Promise<{ isFavorite: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingIndex = mockFavorites.findIndex(
        (fav) => fav.userId === userId && fav.articleId === articleId
      );

      let isFavorite: boolean;

      if (existingIndex === -1) {
        // Thêm vào yêu thích
        const newFavorite: UserFavorite = {
          id: uuidv4(),
          userId,
          articleId,
          createdAt: new Date(),
        };
        mockFavorites.push(newFavorite);
        isFavorite = true;
      } else {
        // Xóa khỏi yêu thích
        mockFavorites.splice(existingIndex, 1);
        isFavorite = false;
      }

      resolve({ isFavorite });
    }, 300);
  });
};

/**
 * Thêm/Xóa phản ứng với bài viết
 */
export const toggleReaction = async (
  userId: string,
  articleId: string,
  reactionType: ReactionType
): Promise<{ count: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingIndex = mockReactions.findIndex(
        (r) =>
          r.userId === userId &&
          r.articleId === articleId &&
          r.reactionType === reactionType
      );

      if (existingIndex === -1) {
        // Thêm phản ứng
        const newReaction: ArticleReaction = {
          id: uuidv4(),
          userId,
          articleId,
          reactionType,
          createdAt: new Date(),
        };
        mockReactions.push(newReaction);
      } else {
        // Xóa phản ứng
        mockReactions.splice(existingIndex, 1);
      }

      // Đếm số lượng phản ứng theo loại
      const count = mockReactions.filter(
        (r) => r.articleId === articleId && r.reactionType === reactionType
      ).length;

      resolve({ count });
    }, 300);
  });
};

/**
 * Tăng số lượt xem cho bài viết
 */
export const incrementArticleViews = async (
  articleId: string
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const article = mockArticles.find((a) => a.id === articleId);
      if (article) {
        article.viewCount += 1;
      }
      resolve();
    }, 200);
  });
};

/**
 * Kiểm tra xem bài viết có trong danh sách yêu thích của người dùng không
 */
export const checkIsFavorite = async (
  userId: string,
  articleId: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isFavorite = mockFavorites.some(
        (fav) => fav.userId === userId && fav.articleId === articleId
      );
      resolve(isFavorite);
    }, 200);
  });
};

/**
 * Xây dựng cây danh mục
 */
export const buildCategoryTree = () => {
  const categoryMap = new Map<string, Category & { children: Category[] }>();

  // Tạo bản sao của tất cả các danh mục và thêm mảng children rỗng
  mockCategories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Xây dựng cây danh mục
  const rootCategories: (Category & { children: Category[] })[] = [];

  categoryMap.forEach((category) => {
    if (category.parentId && categoryMap.has(category.parentId)) {
      // Nếu có parentId và tồn tại trong map, thêm vào children của parent
      categoryMap.get(category.parentId)?.children.push(category);
    } else if (!category.parentId) {
      // Nếu không có parentId, đây là danh mục gốc
      rootCategories.push(category);
    }
  });

  return rootCategories;
};

export default {
  fetchCategories,
  fetchArticlesByCategory,
  fetchArticleById,
  fetchCommentsByArticle,
  fetchPopularArticles,
  fetchRecentArticles,
  fetchFavoriteArticles,
  searchArticles,
  addComment,
  toggleFavorite,
  toggleReaction,
  incrementArticleViews,
  checkIsFavorite,
  buildCategoryTree,
  mockCategories,
  mockArticles,
  mockComments,
  mockReactions,
  mockFavorites,
  mockUsers,
};
