import { useState } from 'react';
import { adminPosts } from "../mocks/postMockData";

// PostEditor는 아직 CMS API가 없는 상태라 로컬 form state와 mock 목록으로만 동작한다.
export default function PostEditor() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '공지사항',
    content: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 저장 API가 붙기 전까지는 form reset과 에디터 닫기만 수행한다.
    console.log('Save post:', formData);
    setShowEditor(false);
    setFormData({ title: '', category: '공지사항', content: '' });
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      category: post.category,
      content: post.content || '',
    });
    setShowEditor(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      console.log('Delete post:', id);
    }
  };

  const getCategoryBadge = (category) => {
    const styles = {
      '공지사항': 'bg-red-100 text-red-700',
      '시장분석': 'bg-blue-100 text-blue-700',
      '투자정보': 'bg-green-100 text-green-700',
      '개발계획': 'bg-purple-100 text-purple-700',
    };
    return styles[category] || 'bg-gray-100 text-gray-700';
  };

  return (
      <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">게시글 작성</h2>
          <p className="text-sm text-gray-600 mt-1">부동산 정보와 분석 자료를 작성합니다</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setFormData({ title: '', category: '공지사항', content: '' });
            setShowEditor(true);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line text-lg"></i>
          새 게시글
        </button>
      </div>

      {/* 에디터 */}
      {showEditor && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm cursor-pointer"
                >
                  <option value="공지사항">공지사항</option>
                  <option value="시장분석">시장분석</option>
                  <option value="투자정보">투자정보</option>
                  <option value="개발계획">개발계획</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* 에디터 툴바 */}
                <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-bold text-gray-600"></i>
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-italic text-gray-600"></i>
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-underline text-gray-600"></i>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-list-unordered text-gray-600"></i>
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-list-ordered text-gray-600"></i>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-image-add-line text-gray-600"></i>
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                    <i className="ri-link text-gray-600"></i>
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 text-sm resize-none"
                  style={{ outline: 'none' }}
                  placeholder="게시글 내용을 입력하세요..."
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                {editingPost ? '수정 완료' : '게시하기'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 게시글 목록 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">게시글 목록</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {adminPosts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">{post.title}</h4>
                  <p className="text-sm text-gray-600" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{post.excerpt}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <i className="ri-eye-line"></i>
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-chat-3-line"></i>
                      {post.comments}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-4 self-end sm:self-auto">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
