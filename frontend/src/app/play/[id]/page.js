'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getActivityQuestions, submitActivityAnswers } from '@/utils/api';
import { Header } from '@/components/header';

export default function PlayPage() {
  const { id } = useParams();
  const router = useRouter();

  const [activity, setActivity] = useState(null);
  const [answers, setAnswers] = useState({}); // {question_id: value}
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unanswered, setUnanswered] = useState([]); // 未作答題目 id 列表

  // 取得活動題目
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getActivityQuestions(id);
        setActivity(data);
      } catch (err) {
        alert('無法取得題目，請確認是否已登入或活動存在');
        router.push(`/details/${id}`);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  // 選擇選項
  const handleOptionSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // 取消該題未答狀態
    setUnanswered((prev) => prev.filter((qid) => qid !== questionId));
  };

  // 提交作答
  const handleSubmit = async () => {
    if (!activity) return;

    // 找出未作答的題目 id
    const unansweredList = activity.questions
      .filter((q) => !answers[q.id])
      .map((q) => q.id);

    if (unansweredList.length > 0) {
      setUnanswered(unansweredList);
      alert('請先完成所有題目再提交');
      return;
    }

    const answersArray = Object.entries(answers).map(([questionId, value]) => ({
      question_id: parseInt(questionId),
      value,
    }));

    try {
      setSubmitting(true);
      const result = await submitActivityAnswers(id, answersArray);

      if (result.passed) {
        alert(`🎉 恭喜通過！答對 ${result.correct_count}/${result.total} 題，累計抽獎次數：${result.times}`);
      } else {
        alert(`😢 沒通過，答對 ${result.correct_count}/${result.total} 題\n${result.message || ''}`);
      }
      router.push(`/details/${id}`);
    } catch (err) {
      console.error(err);
      alert('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container my-5 text-center">載入中...</div>;
  if (!activity) return null;

  return (
    <>
      <Header />
      <section className="container my-5" style={{ background: '#111', padding: 20, borderRadius: 12 }}>
        <h3 style={{ color: '#fff' }}>{activity.Activity_name}</h3>
        <p style={{ color: '#bbb' }}>{activity.descripe}</p>

        {activity.questions.map((q, qi) => (
          <div
            key={q.id}
            style={{
              marginBottom: 20,
              padding: 12,
              border: unanswered.includes(q.id) ? '2px solid #e74c3c' : '2px solid transparent',
              borderRadius: 8,
              background: '#1a1a1a',
            }}
          >
            <strong style={{ color: '#fff' }}>
              {qi + 1}. {q.question_text}
            </strong>
            <div style={{ marginTop: 8 }}>
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.option_value;
                return (
                  <label
                    key={opt.id}
                    style={{
                      display: 'block',
                      margin: '4px 0',
                      padding: '6px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: selected ? '#ffffffff' : '#222',
                      color: selected ? '#000000ff' : '#eee',
                      border: selected ? '1px solid #2ecc71' : '1px solid #444',
                      transition: 'background 0.2s,border 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.option_value}
                      checked={selected}
                      onChange={() => handleOptionSelect(q.id, opt.option_value)}
                      style={{ marginRight: 8 }}
                    />
                    {opt.option_label}. {opt.option_value}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            marginTop: 20,
            background: submitting ? '#888' : '#359943',
            color: '#222',
            fontWeight: 500,
            border: 'none',
            borderRadius: '4px',
            padding: '12px 24px',
            fontSize: 16,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? '提交中...' : '提交作答'}
        </button>
      </section>
    </>
  );
}
