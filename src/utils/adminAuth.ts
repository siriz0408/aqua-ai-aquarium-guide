
export const checkAdminStatus = async () => {
  try {
    console.log('Admin features disabled in simplified version');
    
    // In the simplified version, there are no admins
    return { isAdmin: false, profile: null };
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return { isAdmin: false, profile: null };
  }
};
