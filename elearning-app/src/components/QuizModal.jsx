import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/QuizModal.css';

const QuizModal = ({ quiz, onClose }) => {
  const { user } = useUser();
  const [studentAnswers, setStudentAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz) return null;

  const isStudent = user && user.role === 'STUDENT';
  
  const handleAnswerChange = (questionId, answer) => {
    setStudentAnswers({
      ...studentAnswers,
      [questionId]: answer
    });
  };

  const calculateScore = () => {
    if (!quiz.questions || quiz.questions.length === 0) return 0;
    
    let correctCount = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach(question => {
      const questionId = question.questionId || question._id;
      const studentAnswer = studentAnswers[questionId];
      const points = parseInt(question.questionPoints) || 0;
      totalPoints += points;
      
      if (question.questionType === 'Multiple Choice' && studentAnswer === question.CorrectAns) {
        correctCount += points;
      } else if (question.questionType === 'True/False' && 
                (studentAnswer === question.CorrectAns || 
                 (studentAnswer === 'true' && question.CorrectAns === true) ||
                 (studentAnswer === 'false' && question.CorrectAns === false))) {
        correctCount += points;
      } else if (question.questionType === 'Fill in Blank' && 
                Array.isArray(question.CorrectAns) && 
                question.CorrectAns.includes(studentAnswer)) {
        correctCount += points;
      }
    });
    
    return Math.round((correctCount / totalPoints) * 100);
  };

  const handleSubmitQuiz = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setQuizSubmitted(true);
  };

  const renderStudentView = () => {
    return (
      <div className="quiz-questions-section">
        <h3>Questions ({quiz.questions?.length || 0})</h3>
        {quizSubmitted && (
          <div className="quiz-score">
            <h4>Your Score: {score}%</h4>
            <p>Note: This score is not saved to your records</p>
          </div>
        )}
        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="questions-list">
            {quiz.questions.map((question, index) => {
              const questionId = question.questionId || question._id || index;
              return (
                <div key={questionId} className="question-item">
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                    <span className="question-type">{question.questionType}</span>
                    <span className="question-points">{question.questionPoints} points</span>
                  </div>
                  <div className="question-content">{question.questionContent}</div>
                  
                  <div className="question-options">
                    {question.questionType === 'Multiple Choice' && question.options && (
                      <div className="options-list">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="option-item">
                            <label>
                              <input
                                type="radio"
                                name={`question-${questionId}`}
                                value={option}
                                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                                disabled={quizSubmitted}
                                checked={studentAnswers[questionId] === option}
                              />
                              {option}
                              {quizSubmitted && option === question.CorrectAns && 
                                <span className="correct-indicator"> ✓ (Correct)</span>}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.questionType === 'True/False' && (
                      <div className="true-false-options">
                        <label>
                          <input
                            type="radio"
                            name={`question-${questionId}`}
                            value="true"
                            onChange={(e) => handleAnswerChange(questionId, e.target.value === 'true')}
                            disabled={quizSubmitted}
                            checked={studentAnswers[questionId] === true || studentAnswers[questionId] === 'true'}
                          />
                          True
                          {quizSubmitted && question.CorrectAns === true && 
                            <span className="correct-indicator"> ✓ (Correct)</span>}
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`question-${questionId}`}
                            value="false"
                            onChange={(e) => handleAnswerChange(questionId, e.target.value === 'true')}
                            disabled={quizSubmitted}
                            checked={studentAnswers[questionId] === false || studentAnswers[questionId] === 'false'}
                          />
                          False
                          {quizSubmitted && question.CorrectAns === false && 
                            <span className="correct-indicator"> ✓ (Correct)</span>}
                        </label>
                      </div>
                    )}
                    
                    {question.questionType === 'Fill in Blank' && (
                      <div className="fill-blank-input">
                        <input
                          type="text"
                          placeholder="Type your answer here"
                          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                          disabled={quizSubmitted}
                          value={studentAnswers[questionId] || ''}
                        />
                        {quizSubmitted && (
                          <div className="correct-answer-display">
                            Acceptable answers: {Array.isArray(question.CorrectAns) 
                              ? question.CorrectAns.join(', ') 
                              : question.CorrectAns}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="question-difficulty">
                    Difficulty: {question.questionDifficulty || 'Not specified'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-questions">No questions have been added to this quiz.</p>
        )}
        
        {!quizSubmitted && quiz.questions && quiz.questions.length > 0 && (
          <div className="quiz-actions">
            <button onClick={handleSubmitQuiz} className="submit-quiz-btn">
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInstructorView = () => {
    return (
      <div className="quiz-questions-section">
        <h3>Questions ({quiz.questions?.length || 0})</h3>
        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="questions-list">
            {quiz.questions.map((question, index) => (
              <div key={question.questionId || index} className="question-item">
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className="question-type">{question.questionType}</span>
                  <span className="question-points">{question.questionPoints} points</span>
                </div>
                <div className="question-content">{question.questionContent}</div>
                
                <div className="question-options">
                  {question.questionType === 'Multiple Choice' && question.options && (
                    <div className="options-list">
                      <strong>Options:</strong>
                      <ul>
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex} className={option === question.CorrectAns ? 'correct-answer' : ''}>
                            {option}
                            {option === question.CorrectAns && ' ✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {question.questionType === 'True/False' && (
                    <div className="true-false">
                      <strong>Answer:</strong> {question.CorrectAns ? 'True' : 'False'}
                    </div>
                  )}
                  
                  {question.questionType === 'Fill in Blank' && question.CorrectAns && (
                    <div className="fill-blank">
                      <strong>Acceptable Answers:</strong>
                      <ul>
                        {Array.isArray(question.CorrectAns) ? 
                          question.CorrectAns.map((ans, ansIndex) => (
                            <li key={ansIndex}>{ans}</li>
                          )) : 
                          <li>{question.CorrectAns}</li>
                        }
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="question-difficulty">
                  Difficulty: {question.questionDifficulty || 'Not specified'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-questions">No questions have been added to this quiz.</p>
        )}
      </div>
    );
  };

  return (
    <div className="quiz-modal-overlay" onClick={onClose}>
      <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-modal-header">
          <h2>{quiz.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="quiz-modal-details">
          <div className="quiz-detail-item">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{quiz.description || 'No description provided'}</span>
          </div>
          <div className="quiz-detail-item">
            <span className="detail-label">Points:</span>
            <span className="detail-value">{quiz.points}</span>
          </div>
          <div className="quiz-detail-item">
            <span className="detail-label">Time Limit:</span>
            <span className="detail-value">{quiz.timeLimit} minutes</span>
          </div>
          <div className="quiz-detail-item">
            <span className="detail-label">Due Date:</span>
            <span className="detail-value">{quiz.due || 'No due date set'}</span>
          </div>
        </div>
        
        {isStudent ? renderStudentView() : renderInstructorView()}
      </div>
    </div>
  );
};

export default QuizModal;
