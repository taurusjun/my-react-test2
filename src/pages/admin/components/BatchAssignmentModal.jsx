import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

const BatchAssignmentModal = ({ 
  open, 
  onClose, 
  exams, 
  users, 
  onAssign,
  loading = false 
}) => {
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');

  const handleAssign = () => {
    if (selectedExams.length === 0) {
      setError('请选择至少一个考试');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('请选择至少一个用户');
      return;
    }

    setError('');
    
    const assignments = [];
    
    // 所有考试分配给所有用户
    selectedExams.forEach(exam => {
      selectedUsers.forEach(user => {
        assignments.push({
          examUuid: exam.uuid,
          userUuid: user.uuid,
          examName: exam.name,
          userName: user.name
        });
      });
    });

    onAssign(assignments);
  };

  const handleClose = () => {
    setSelectedExams([]);
    setSelectedUsers([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1 }} />
          批量关联考试与用户
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={exams}
              getOptionLabel={(option) => option.name}
              value={selectedExams}
              onChange={(event, newValue) => setSelectedExams(newValue)}
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
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.uuid}
                  />
                ))
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              已选择 {selectedExams.length} 个考试
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.username})`}
              value={selectedUsers}
              onChange={(event, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="选择用户" fullWidth />
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
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.name} (${option.username})`}
                    {...getTagProps({ index })}
                    key={option.uuid}
                  />
                ))
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              已选择 {selectedUsers.length} 个用户
            </Typography>
          </Grid>

          {selectedExams.length > 0 && selectedUsers.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                将创建 {selectedExams.length * selectedUsers.length} 个关联
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button 
          onClick={handleAssign} 
          variant="contained" 
          disabled={loading || selectedExams.length === 0 || selectedUsers.length === 0}
        >
          {loading ? '处理中...' : '确认关联'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchAssignmentModal;
