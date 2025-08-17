import React, { useContext } from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { UserContext } from '../../contexts/UserContext';
import { USER_ROLES } from '../../config/menuItems';

const RoleDisplay = ({ showLabel = true, variant = 'outlined', size = 'small' }) => {
  const { user } = useContext(UserContext);
  
  if (!user) return null;

  const userRole = user.role || USER_ROLES.STUDENT;

  const getRoleConfig = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return {
          label: '管理员',
          color: 'error',
          textColor: '#fff'
        };
      case USER_ROLES.TEACHER:
        return {
          label: '教师',
          color: 'primary',
          textColor: '#fff'
        };
      case USER_ROLES.STUDENT:
        return {
          label: '学生',
          color: 'success',
          textColor: '#fff'
        };
      default:
        return {
          label: '未知',
          color: 'default',
          textColor: '#666'
        };
    }
  };

  const roleConfig = getRoleConfig(userRole);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          角色：
        </Typography>
      )}
      <Chip
        label={roleConfig.label}
        color={roleConfig.color}
        variant={variant}
        size={size}
        sx={{
          fontWeight: 'bold',
          '& .MuiChip-label': {
            color: roleConfig.textColor
          }
        }}
      />
    </Box>
  );
};

export default RoleDisplay;
