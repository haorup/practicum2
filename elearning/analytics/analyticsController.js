import Course from '../course/model.js';
import User from '../user/model.js';
import Enrollment from '../enrollment/model.js';

// Get student performance data
export const getStudentPerformance = async (req, res) => {
  try {
    // Get user role statistics
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          role: "$_id",
          count: 1
        }
      }
    ]);

    // Format role names
    const roleLabels = {
      'STUDENT': 'Student',
      'INSTRUCTOR': 'Instructor',
      'ADMIN': 'Admin'
    };

    const labels = roleStats.map(stat => roleLabels[stat.role] || stat.role);
    const counts = roleStats.map(stat => stat.count);

    res.json({
      labels,
      counts,
      totalUsers: counts.reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    console.error('Error in getStudentPerformance:', error);
    res.status(500).json({ error: 'Error fetching user role statistics' });
  }
};

// Get course analytics data
export const getCourseAnalytics = async (req, res) => {
  try {
    // Get basic course statistics
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({
      status: 'ACTIVE'
    });

    // Get credit type statistics
    const creditStats = await Course.aggregate([
      {
        $group: {
          _id: "$credits",
          courseCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get department statistics
    const departmentStats = await Course.aggregate([
      {
        $group: {
          _id: "$department",
          courseCount: { $sum: 1 },
          courses: {
            $push: {
              _id: "$_id",
              name: "$name"
            }
          }
        }
      },
      {
        $lookup: {
          from: "enrollment",
          let: { courseIds: "$courses._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$course", "$$courseIds"]
                }
              }
            }
          ],
          as: "enrollments"
        }
      },
      {
        $project: {
          department: "$_id",
          courseCount: 1,
          studentCount: { $size: "$enrollments" }
        }
      },
      {
        $sort: { courseCount: -1 }
      }
    ]);

    // Prepare data for chart display
    const creditLabels = creditStats.map(stat => `${stat._id} Credits`);
    const creditData = creditStats.map(stat => stat.courseCount);

    const departmentLabels = departmentStats.map(dept => dept.department);
    const departmentCourseData = departmentStats.map(dept => dept.courseCount);
    const departmentStudentData = departmentStats.map(dept => dept.studentCount);

    res.json({
      creditLabels,
      creditData,
      departmentLabels,
      departmentCourseData,
      departmentStudentData,
      totalCourses,
      activeCourses,
      departmentStats
    });
  } catch (error) {
    console.error('Error in getCourseAnalytics:', error);
    res.status(500).json({ error: 'Error fetching course analytics data' });
  }
};

// Real-time data updates (WebSocket)
let wsClients = new Set();

export const handleWebSocket = (ws) => {
  wsClients.add(ws);

  ws.on('close', () => {
    wsClients.delete(ws);
  });

  // Send periodic updates
  const sendUpdates = async () => {
    try {
      const [studentData, courseData] = await Promise.all([
        getStudentPerformance(),
        getCourseAnalytics()
      ]);

      ws.send(JSON.stringify({
        type: 'dashboard-update',
        data: { studentData, courseData }
      }));
    } catch (error) {
      console.error('Error sending real-time updates:', error);
    }
  };

  // Send updates every 30 seconds
  const updateInterval = setInterval(sendUpdates, 30000);

  ws.on('close', () => {
    clearInterval(updateInterval);
  });
}; 