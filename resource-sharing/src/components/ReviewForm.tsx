import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';

interface ReviewFormProps {
  resourceId: string;
  resourceType: 'item' | 'skill';
  existingReviews?: any[];
}

export function ReviewForm({ resourceId, resourceType, existingReviews = [] }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addReview } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    addReview({
      resourceId,
      resourceType,
      userId: 'current-user',
      userName: '匿名用户',
      rating,
      comment: comment.trim(),
    });

    setSubmitted(true);
    setRating(0);
    setComment('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const avgRating = existingReviews.length > 0
    ? existingReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / existingReviews.length
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">用户评价</h3>
      
      {/* 评分统计 */}
      {existingReviews.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{avgRating.toFixed(1)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-text-muted">{existingReviews.length} 条评价</p>
            </div>
          </div>
        </div>
      )}

      {/* 评价列表 */}
      {existingReviews.length > 0 && (
        <div className="space-y-4 mb-6">
          {existingReviews.slice(0, 3).map((review: any) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {review.userName.charAt(0)}
                  </div>
                  <span className="font-medium text-sm">{review.userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-text-secondary">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* 提交评价表单 */}
      {submitted ? (
        <div className="text-center py-4 text-green-600 font-medium">
          ✓ 评价提交成功
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">评分</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">评价内容</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="分享您的使用体验..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <Button type="submit" className="w-full gap-2">
            <Send className="w-4 h-4" />
            提交评价
          </Button>
        </form>
      )}
    </div>
  );
}
