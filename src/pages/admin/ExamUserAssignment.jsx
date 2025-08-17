import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import TablePagination from '@mui/material/TablePagination';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { USER_ROLES } from '../../config/menuItems';
import CommonLayout from '../../layouts/CommonLayout';
import CommonBreadcrumbs from '../../components/CommonBreadcrumbs';
import { getBreadcrumbPaths } from '../../config/breadcrumbPaths';
import BatchAssignmentModal from './components/BatchAssignmentModal';

const ExamUserAssignment = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterExamUuid, setFilterExamUuid] = useState('');
  const [filterUserUuid, setFilterUserUuid] = useState('');

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 获取考试列表和用户列表
        const [examsResponse, usersResponse] = await Promise.all([
          axios.get("/api/exams/list", {
            params: {
              page: 1,
              pageSize: 100,
            },
          }),
          axios.get('/api/users')
        ]);

        const examsData = examsResponse.data.data?.exams || [];
        setExams(examsData);
        setUsers(usersResponse.data.data || []);
      } catch (error) {
        console.error('初始化数据失败:', error);
        setSnackbar({
          open: true,
          message: '初始化数据失败',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 搜索数据
  useEffect(() => {
    fetchData();
  }, [page, pageSize, filterExamUuid, filterUserUuid]);

  // 检查管理员权限
  if (!user || user.role !== USER_ROLES.ADMIN) {
    return (
      <CommonLayout currentPage="考试用户关联管理">
        <Alert severity="error">
          您没有权限访问此页面。需要管理员权限。
        </Alert>
      </CommonLayout>
    );
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取关联数据
      const assignmentsResponse = await axios.get('/api/user-exam/list', {
        params: {
          page,
          pageSize,
          exam_uuid: filterExamUuid || undefined,
          user_uuid: filterUserUuid || undefined
        }
      });

      setAssignments(assignmentsResponse.data.data?.assignments || []);
      setTotalCount(assignmentsResponse.data.data?.totalCount || 0);
    } catch (error) {
      console.error('获取数据失败:', error);
      setSnackbar({
        open: true,
        message: '获取数据失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = () => {
    if (!filterExamUuid || !filterUserUuid) {
      setSnackbar({
        open: true,
        message: '请选择考试和用户',
        severity: 'warning'
      });
      return;
    }

    const exam = exams.find(e => e.uuid === filterExamUuid);
    const user = users.find(u => u.uuid === filterUserUuid);
    
    if (!exam || !user) {
      setSnackbar({
        open: true,
        message: '考试或用户不存在',
        severity: 'error'
      });
      return;
    }

    const newAssignment = {
      examUuid: exam.uuid,
      userUuid: user.uuid,
      examName: exam.name,
      userName: user.name,
      status: 'init',
      assignedAt: new Date().toISOString()
    };

    setAssignments(prev => [...prev, newAssignment]);
    
    // 清除过滤条件
    setFilterExamUuid('');
    setFilterUserUuid('');

    setSnackbar({
      open: true,
      message: '已添加关联',
      severity: 'success'
    });
  };

  const handleRemoveAssignment = (assignmentId) => {
    setAssignments(prev => prev.filter(a => a.uuid !== assignmentId));
    setSnackbar({
      open: true,
      message: '已移除关联',
      severity: 'success'
    });
  };



  const handleBatchAssign = (batchAssignments) => {
    const newAssignments = batchAssignments.map(assignment => ({
      ...assignment,
      status: 'init',
      assignedAt: new Date().toISOString()
    }));

    setAssignments(prev => [...prev, ...newAssignments]);
    setBatchModalOpen(false);

    setSnackbar({
      open: true,
      message: `已批量添加 ${newAssignments.length} 个关联`,
      severity: 'success'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'init': return 'default';
      case 'progress': return 'warning';
      case 'submit': return 'info';
      case 'graded': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'init': return '初始化';
      case 'progress': return '做题中';
      case 'submit': return '已提交';
      case 'graded': return '已批改';
      default: return '未知';
    }
  };

  const breadcrumbPaths = getBreadcrumbPaths().examUserAssignment;

  return (
    <CommonLayout 
      currentPage="考试用户关联管理"
      showBreadcrumbs={true}
      BreadcrumbsComponent={() => <CommonBreadcrumbs paths={breadcrumbPaths} />}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          考试用户关联管理
        </Typography>

        {/* 关联管理 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              关联管理
            </Typography>
            <Grid container spacing={2} alignItems="center">
                             <Grid item xs={12} md={3}>
                 <Autocomplete
                   options={exams}
                   getOptionLabel={(option) => option.name}
                   value={exams.find(e => e.uuid === filterExamUuid) || null}
                   filterOptions={(options, { inputValue }) => {
                     if (!inputValue) return options;
                     return options.filter(option =>
                       option.name.toLowerCase().includes(inputValue.toLowerCase())
                     );
                   }}
                   onChange={(event, newValue) => {
                     setFilterExamUuid(newValue?.uuid || '');
                   }}
                   renderInput={(params) => (
                     <TextField {...params} label="选择考试" fullWidth />
                   )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.category} • {option.gradeInfo?.school} {option.gradeInfo?.grade} • {option.totalQuestions}题 • {option.totalScore}分
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple={false}
                  options={users}
                  getOptionLabel={(option) => `${option.name} (${option.username})`}
                  value={users.find(u => u.uuid === filterUserUuid) || null}
                  filterOptions={(options, { inputValue }) => {
                    if (!inputValue) return options;
                    return options.filter(option =>
                      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      option.username.toLowerCase().includes(inputValue.toLowerCase())
                    );
                  }}
                  onChange={(event, newValue) => {
                    setFilterUserUuid(newValue?.uuid || '');
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="搜索用户" fullWidth />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.username} • {option.role}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterExamUuid('');
                    setFilterUserUuid('');
                    setPage(1);
                  }}
                  fullWidth
                >
                  清除
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                {filterExamUuid && filterUserUuid && totalCount === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                                      onClick={handleAddAssignment}
                    fullWidth
                    color="success"
                  >
                    添加关联
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<GroupAddIcon />}
            onClick={() => setBatchModalOpen(true)}
            disabled={loading}
          >
            批量关联
          </Button>
        </Box>

        {/* 关联列表 */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>考试名称</TableCell>
                  <TableCell>用户</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>关联时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        暂无关联数据
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.uuid || `${assignment.examUuid}-${assignment.userUuid}`}>
                      <TableCell>
                        <Typography variant="body1">{assignment.examName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{assignment.userName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(assignment.status)}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.assignedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="移除关联">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAssignment(assignment.uuid)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* 分页 */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(1);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} 共 ${count}`}
        />

        {/* 统计信息 */}
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    总关联数
                  </Typography>
                  <Typography variant="h4">
                    {assignments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    初始化
                  </Typography>
                  <Typography variant="h4">
                    {assignments.filter(a => a.status === 'init').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    做题中
                  </Typography>
                  <Typography variant="h4">
                    {assignments.filter(a => a.status === 'progress').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    已提交
                  </Typography>
                  <Typography variant="h4">
                    {assignments.filter(a => a.status === 'submit').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    已批改
                  </Typography>
                  <Typography variant="h4">
                    {assignments.filter(a => a.status === 'graded').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* 批量关联模态框 */}
        <BatchAssignmentModal
          open={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          exams={exams}
          users={users}
          onAssign={handleBatchAssign}
          loading={loading}
        />
      </Box>
    </CommonLayout>
  );
};

export default ExamUserAssignment;
