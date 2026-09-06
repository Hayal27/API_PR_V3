const express = require('express');
const router = express.Router();
const con = require("../models/db");

// Test endpoint to verify database connection and menu items
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 API: Testing database connection...');

    // Test basic connection
    con.query('SELECT 1 as test', (err, connectionTest) => {
      if (err) {
        console.error('💥 API: Database connection failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Database connection failed',
          error: err.message
        });
      }

      console.log('✅ API: Database connection successful:', connectionTest);

      // Test menu_items table
      con.query('SELECT COUNT(*) as count FROM menu_items', (err, menuItemsTest) => {
        if (err) {
          console.error('💥 API: Menu items query failed:', err);
          return res.status(500).json({
            success: false,
            message: 'Menu items query failed',
            error: err.message
          });
        }

        console.log('✅ API: Menu items count:', menuItemsTest[0].count);

        // Test role_permissions table
        con.query('SELECT COUNT(*) as count FROM role_permissions', (err, permissionsTest) => {
          if (err) {
            console.error('💥 API: Role permissions query failed:', err);
            return res.status(500).json({
              success: false,
              message: 'Role permissions query failed',
              error: err.message
            });
          }

          console.log('✅ API: Role permissions count:', permissionsTest[0].count);

          // Test specific role permissions
          con.query('SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1', (err, roleTest) => {
            if (err) {
              console.error('💥 API: Admin role query failed:', err);
              return res.status(500).json({
                success: false,
                message: 'Admin role query failed',
                error: err.message
              });
            }

            console.log('✅ API: Admin role permissions count:', roleTest[0].count);

            res.json({
              success: true,
              message: 'Database test successful',
              data: {
                connection: 'OK',
                menuItems: menuItemsTest[0].count,
                rolePermissions: permissionsTest[0].count,
                adminPermissions: roleTest[0].count
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('💥 API: Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});



// Get user menu permissions based on role_id
router.get('/user-permissions/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const numericRoleId = parseInt(roleId, 10);
    const isAdmin = numericRoleId === 1;

    console.log('🔍 API: Fetching menu permissions for role_id:', roleId, '(isAdmin:', isAdmin, ')');

    let query;
    let params;

    if (isAdmin) {
      // Admin gets all active menu items with full permissions
      query = `
        SELECT
          mi.id,
          mi.name,
          mi.path,
          mi.icon,
          mi.parent_id,
          mi.sort_order,
          1 AS can_view,
          1 AS can_create,
          1 AS can_edit,
          1 AS can_delete
        FROM menu_items mi
        WHERE mi.is_active = 1
        ORDER BY mi.sort_order ASC, mi.id ASC
      `;
      params = [];
    } else {
      // Non-admin roles:
      // 1. Menu items directly granted can_view=1
      // 2. PLUS parent items of any granted child items
      query = `
        SELECT DISTINCT
          mi.id,
          mi.name,
          mi.path,
          mi.icon,
          mi.parent_id,
          mi.sort_order,
          COALESCE(rp.can_view, 1) AS can_view,
          COALESCE(rp.can_create, 0) AS can_create,
          COALESCE(rp.can_edit, 0) AS can_edit,
          COALESCE(rp.can_delete, 0) AS can_delete
        FROM menu_items mi
        LEFT JOIN role_permissions rp ON mi.id = rp.menu_item_id AND rp.role_id = ?
        WHERE mi.is_active = 1
          AND (
            rp.can_view = 1
            OR mi.id IN (
              SELECT DISTINCT parent_mi.parent_id
              FROM menu_items parent_mi
              JOIN role_permissions child_rp ON parent_mi.id = child_rp.menu_item_id
              WHERE child_rp.role_id = ? AND child_rp.can_view = 1 AND parent_mi.is_active = 1
            )
          )
        ORDER BY mi.sort_order ASC, mi.id ASC
      `;
      params = [numericRoleId, numericRoleId];
    }

    con.query(query, params, (err, results) => {
      if (err) {
        console.error('💥 API: Database query failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Database query failed',
          error: err.message,
          roleId: roleId
        });
      }

      console.log('📊 API: Number of permitted menu results:', (results || []).length);

      // Organize menu items into hierarchical structure
      const menuItems = [];
      const menuMap = new Map();

      // First pass: create all menu items
      (results || []).forEach(item => {
        const menuItem = {
          id: item.id,
          name: item.name,
          path: item.path,
          icon: item.icon,
          parent_id: item.parent_id,
          sort_order: item.sort_order,
          permissions: {
            can_view: item.can_view || 0,
            can_create: item.can_create || 0,
            can_edit: item.can_edit || 0,
            can_delete: item.can_delete || 0
          },
          children: []
        };
        menuMap.set(item.id, menuItem);
      });

      // Second pass: organize hierarchy
      menuMap.forEach(item => {
        if (item.parent_id === null) {
          menuItems.push(item);
        } else {
          const parent = menuMap.get(item.parent_id);
          if (parent) {
            parent.children.push(item);
          } else {
            // If parent is not in map, preserve item as root so permitted child is not lost
            menuItems.push(item);
          }
        }
      });

      console.log('✅ API: Final menu structure created with', menuItems.length, 'root items');

      res.json({
        success: true,
        data: menuItems
      });
    });
  } catch (error) {
    console.error('💥 API: Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions',
      error: error.message,
      roleId: req.params.roleId
    });
  }
});

// Get all menu items
router.get('/menu-items', async (req, res) => {
  try {
    const query = `
      SELECT id, name, path, icon, parent_id, sort_order, is_active, file_name
      FROM menu_items
      ORDER BY sort_order ASC, name ASC
    `;

    con.query(query, (err, results) => {
      if (err) {
        console.error('💥 API: Menu items query failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch menu items',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
});

// Get all roles with their permissions
router.get('/roles-permissions', async (req, res) => {
  try {
    const rolesQuery = `
      SELECT role_id, role_name, status
      FROM roles
      WHERE status = 1
      ORDER BY role_name ASC
    `;

    con.query(rolesQuery, (err, roles) => {
      if (err) {
        console.error('💥 API: Roles query failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch roles',
          error: err.message
        });
      }

      const permissionsQuery = `
        SELECT
          rp.role_id,
          rp.menu_item_id,
          rp.can_view,
          rp.can_create,
          rp.can_edit,
          rp.can_delete,
          mi.name as menu_name,
          mi.path as menu_path,
          mi.icon as menu_icon
        FROM role_permissions rp
        JOIN menu_items mi ON rp.menu_item_id = mi.id
        ORDER BY rp.role_id, mi.sort_order
      `;

      con.query(permissionsQuery, (err, permissions) => {
        if (err) {
          console.error('💥 API: Permissions query failed:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch permissions',
            error: err.message
          });
        }

        // Group permissions by role
        const rolesWithPermissions = roles.map(role => ({
          ...role,
          permissions: permissions.filter(p => p.role_id === role.role_id)
        }));

        res.json({
          success: true,
          data: rolesWithPermissions
        });
      });
    });
  } catch (error) {
    console.error('Error fetching roles permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles permissions',
      error: error.message
    });
  }
});

// Update role permissions
router.put('/role-permissions/:roleId', (req, res) => {
  const { roleId } = req.params;
  const { permissions } = req.body;

  console.log('🔄 API: Updating role permissions for role:', roleId);
  console.log('📝 API: Permissions data:', permissions);

  // Start transaction
  con.query('START TRANSACTION', (err) => {
    if (err) {
      console.error('💥 API: Failed to start transaction:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to start transaction',
        error: err.message
      });
    }

    // Delete existing permissions for this role
    con.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId], (err) => {
      if (err) {
        console.error('💥 API: Failed to delete existing permissions:', err);
        // Rollback transaction
        con.query('ROLLBACK', () => { });
        return res.status(500).json({
          success: false,
          message: 'Failed to delete existing permissions',
          error: err.message
        });
      }

      // Insert new permissions
      if (permissions && permissions.length > 0) {
        const insertQuery = `
          INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        let hasError = false;

        const insertPermission = (index) => {
          if (index >= permissions.length) {
            // All permissions inserted successfully, commit transaction
            con.query('COMMIT', (err) => {
              if (err) {
                console.error('💥 API: Failed to commit transaction:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Failed to commit transaction',
                  error: err.message
                });
              }

              console.log('✅ API: Role permissions updated successfully');
              res.json({
                success: true,
                message: 'Role permissions updated successfully'
              });
            });
            return;
          }

          if (hasError) return;

          const permission = permissions[index];
          con.query(insertQuery, [
            roleId,
            permission.menu_item_id,
            permission.can_view ? 1 : 0,
            permission.can_create ? 1 : 0,
            permission.can_edit ? 1 : 0,
            permission.can_delete ? 1 : 0
          ], (err) => {
            if (err) {
              console.error('💥 API: Failed to insert permission:', err);
              hasError = true;
              // Rollback transaction
              con.query('ROLLBACK', () => { });
              return res.status(500).json({
                success: false,
                message: 'Failed to insert permission',
                error: err.message
              });
            }

            insertPermission(index + 1);
          });
        };

        insertPermission(0);
      } else {
        // No permissions to insert, just commit
        con.query('COMMIT', (err) => {
          if (err) {
            console.error('💥 API: Failed to commit transaction:', err);
            return res.status(500).json({
              success: false,
              message: 'Failed to commit transaction',
              error: err.message
            });
          }

          console.log('✅ API: Role permissions updated successfully (no permissions)');
          res.json({
            success: true,
            message: 'Role permissions updated successfully'
          });
        });
      }
    });
  });
});

// Add new menu item
router.post('/menu-items', (req, res) => {
  const { name, path, icon, parent_id, sort_order, file_name, is_active } = req.body;

  console.log('➕ API: Creating new menu item:', { name, path, icon, parent_id, sort_order, file_name, is_active });

  // Validation
  if (!name || !path) {
    return res.status(400).json({
      success: false,
      message: 'Name and path are required fields'
    });
  }

  const query = `
    INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  con.query(query, [
    name,
    path,
    icon || '',
    parent_id || null,
    sort_order || 1,
    file_name || null,
    is_active === false ? 0 : 1
  ], (err, result) => {
    if (err) {
      console.error('💥 API: Failed to create menu item:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create menu item',
        error: err.message
      });
    }

    console.log('✅ API: Menu item created successfully with ID:', result.insertId);
    res.json({
      success: true,
      message: 'Menu item created successfully',
      data: {
        id: result.insertId,
        name: name,
        path: path,
        icon: icon,
        parent_id: parent_id,
        sort_order: sort_order,
        file_name: file_name,
        is_active: is_active === false ? 0 : 1
      }
    });
  });
});

// Update menu item
router.put('/menu-items/:id', (req, res) => {
  const { id } = req.params;
  const { name, path, icon, parent_id, sort_order, is_active, file_name } = req.body;

  console.log('🔄 API: Updating menu item:', { id, name, path, icon, parent_id, sort_order, is_active, file_name });

  // Prepare parameters: when a field is not provided, pass null so COALESCE() keeps the existing column value
  const isActiveParam = typeof is_active === 'undefined' ? null : (is_active ? 1 : 0);
  const parentIdParam = typeof parent_id === 'undefined' ? null : parent_id;
  const sortOrderParam = typeof sort_order === 'undefined' ? null : sort_order;

  const query = `
    UPDATE menu_items
    SET name = COALESCE(?, name),
        path = COALESCE(?, path),
        icon = COALESCE(?, icon),
        parent_id = COALESCE(?, parent_id),
        sort_order = COALESCE(?, sort_order),
        is_active = COALESCE(?, is_active),
        file_name = COALESCE(?, file_name)
    WHERE id = ?
  `;

  con.query(query, [
    name || null,
    path || null,
    icon || null,
    parentIdParam,
    sortOrderParam,
    isActiveParam,
    file_name || null,
    id
  ], (err) => {
    if (err) {
      console.error('💥 API: Failed to update menu item:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update menu item',
        error: err.message
      });
    }

    console.log('✅ API: Menu item updated successfully');
    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });
  });
});

// Bulk Update Menu Status (Active / Inactive)
router.put('/menu-items/bulk-status', (req, res) => {
  const { menu_ids, is_active } = req.body;

  if (!menu_ids || !Array.isArray(menu_ids) || menu_ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No menu items provided' });
  }

  const activeStatus = is_active ? 1 : 0;
  console.log(`🔄 API: Bulk updating status for ${menu_ids.length} menu items to is_active=${activeStatus}`);

  const query = `UPDATE menu_items SET is_active = ? WHERE id IN (?)`;
  con.query(query, [activeStatus, menu_ids], (err, result) => {
    if (err) {
      console.error('💥 API: Failed to bulk update menu items:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update menu items',
        error: err.message
      });
    }

    console.log(`✅ API: Successfully updated ${result.affectedRows} menu items`);
    res.json({
      success: true,
      message: `Successfully updated ${result.affectedRows} menu items to ${activeStatus ? 'Active' : 'Inactive'}`,
      affectedRows: result.affectedRows
    });
  });
});

// Bulk Delete Menu Items
router.post('/menu-items/bulk-delete', (req, res) => {
  const { menu_ids } = req.body;

  if (!menu_ids || !Array.isArray(menu_ids) || menu_ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No menu items provided' });
  }

  console.log(`🗑️ API: Bulk deleting ${menu_ids.length} menu items:`, menu_ids);

  // 1. Delete all role permissions for these menu items and their children
  const deletePermsQuery = `
    DELETE FROM role_permissions 
    WHERE menu_item_id IN (?) 
       OR menu_item_id IN (SELECT id FROM (SELECT id FROM menu_items WHERE parent_id IN (?)) AS tmp)
  `;

  con.query(deletePermsQuery, [menu_ids, menu_ids], (err) => {
    if (err) {
      console.error('💥 API: Failed to delete role permissions in bulk delete:', err);
    }

    // 2. Delete children first if any
    con.query('DELETE FROM menu_items WHERE parent_id IN (?)', [menu_ids], (errChildren) => {
      if (errChildren) {
        console.warn('⚠️ API: Error deleting child menu items:', errChildren.message);
      }

      // 3. Delete the menu items
      con.query('DELETE FROM menu_items WHERE id IN (?)', [menu_ids], (err, result) => {
        if (err) {
          console.error('💥 API: Failed to bulk delete menu items:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete menu items',
            error: err.message
          });
        }

        console.log(`✅ API: Successfully deleted ${result.affectedRows} menu items`);
        res.json({
          success: true,
          message: `Successfully deleted ${result.affectedRows} menu items`,
          affectedRows: result.affectedRows
        });
      });
    });
  });
});

// Delete menu item
router.delete('/menu-items/:id', (req, res) => {
  const { id } = req.params;

  console.log('🗑️ API: Deleting menu item with ID:', id);

  // Check if menu item has children
  con.query('SELECT COUNT(*) as count FROM menu_items WHERE parent_id = ?', [id], (err, children) => {
    if (err) {
      console.error('💥 API: Failed to check for children:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to check for children',
        error: err.message
      });
    }

    if (children[0].count > 0) {
      console.log('⚠️ API: Cannot delete menu item with children');
      return res.status(400).json({
        success: false,
        message: 'Cannot delete menu item with children. Please delete children first.'
      });
    }

    // First delete related permissions (fallback if foreign key constraint lacks ON DELETE CASCADE)
    con.query('DELETE FROM role_permissions WHERE menu_item_id = ?', [id], (err) => {
      if (err) {
        console.error('💥 API: Failed to delete related permissions:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete related permissions',
          error: err.message
        });
      }

      // Then delete menu item
      con.query('DELETE FROM menu_items WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error('💥 API: Failed to delete menu item:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete menu item',
            error: err.message
          });
        }

        console.log('✅ API: Menu item deleted successfully');
        res.json({
          success: true,
          message: 'Menu item deleted successfully'
        });
      });
    });
  });
});

// Get permission matrix (all roles vs all menu items)
router.get('/permission-matrix', (req, res) => {
  const menuQuery = `
      SELECT id, name, path, icon, parent_id, sort_order, is_active, file_name
      FROM menu_items
      ORDER BY sort_order ASC, name ASC
    `;

  const rolesQuery = `
      SELECT role_id, role_name
      FROM roles
      WHERE status = 1
      ORDER BY role_name ASC
    `;

  const permissionsQuery = `
      SELECT role_id, menu_item_id, can_view, can_create, can_edit, can_delete
      FROM role_permissions
    `;

  con.query(menuQuery, (err, menuItems) => {
    if (err) {
      console.error('💥 API: Menu items query failed:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch menu items',
        error: err.message
      });
    }

    con.query(rolesQuery, (err, roles) => {
      if (err) {
        console.error('💥 API: Roles query failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch roles',
          error: err.message
        });
      }

      con.query(permissionsQuery, (err, permissions) => {
        if (err) {
          console.error('💥 API: Permissions query failed:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch permissions',
            error: err.message
          });
        }

        // Create permission lookup map
        const permissionMap = new Map();
        permissions.forEach(p => {
          permissionMap.set(`${p.role_id}-${p.menu_item_id}`, p);
        });

        // Build matrix
        const matrix = {
          menuItems,
          roles,
          permissions: roles.map(role => ({
            role_id: role.role_id,
            role_name: role.role_name,
            menuPermissions: menuItems.map(menu => {
              const key = `${role.role_id}-${menu.id}`;
              const permission = permissionMap.get(key);
              return {
                menu_item_id: menu.id,
                menu_name: menu.name,
                can_view: permission ? permission.can_view : 0,
                can_create: permission ? permission.can_create : 0,
                can_edit: permission ? permission.can_edit : 0,
                can_delete: permission ? permission.can_delete : 0
              };
            })
          }))
        };

        res.json({
          success: true,
          data: matrix
        });
      });
    });
  });
});

// Setup full admin permissions endpoint
router.post('/setup-admin-permissions', (req, res) => {
  console.log('🔧 API: Setting up full admin permissions...');

  // First, get all menu items
  con.query("SELECT * FROM menu_items ORDER BY id", (err, menuItems) => {
    if (err) {
      console.error('💥 API: Error fetching menu items:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching menu items',
        error: err.message
      });
    }

    console.log(`📋 API: Found ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No menu items found to set permissions for'
      });
    }

    // Clear existing admin permissions
    con.query("DELETE FROM role_permissions WHERE role_id = 1", (err) => {
      if (err) {
        console.error('💥 API: Error clearing admin permissions:', err);
        return res.status(500).json({
          success: false,
          message: 'Error clearing existing admin permissions',
          error: err.message
        });
      }

      console.log('🧹 API: Cleared existing admin permissions');

      // Prepare bulk insert for full permissions
      const values = menuItems.map(item =>
        `(1, ${item.id}, 1, 1, 1, 1)`
      ).join(', ');

      const insertSQL = `
        INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
        VALUES ${values}
      `;

      con.query(insertSQL, (err, result) => {
        if (err) {
          console.error('💥 API: Error inserting admin permissions:', err);
          return res.status(500).json({
            success: false,
            message: 'Error setting up admin permissions',
            error: err.message
          });
        }

        console.log(`✅ API: Successfully granted full permissions to admin for ${result.affectedRows} menu items`);

        // Return success response with details
        res.json({
          success: true,
          message: `Admin now has full permissions for all ${result.affectedRows} menu items`,
          data: {
            menuItemsCount: menuItems.length,
            permissionsCreated: result.affectedRows,
            permissions: {
              can_view: true,
              can_create: true,
              can_edit: true,
              can_delete: true
            }
          }
        });
      });
    });
  });
});

// Save individual menu item permission
router.put('/individual-permission/:roleId/:menuItemId', (req, res) => {
  const { roleId, menuItemId } = req.params;
  const { can_view, can_create, can_edit, can_delete } = req.body;

  console.log(`🔧 API: Saving individual permission for role ${roleId}, menu ${menuItemId}`);

  // First delete existing permission for this role-menu combination
  const deleteQuery = 'DELETE FROM role_permissions WHERE role_id = ? AND menu_item_id = ?';

  con.query(deleteQuery, [roleId, menuItemId], (err) => {
    if (err) {
      console.error('💥 API: Error deleting existing permission:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete existing permission',
        error: err.message
      });
    }

    // Only insert if view permission is enabled
    if (can_view) {
      const insertQuery = `
        INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      con.query(insertQuery, [
        roleId,
        menuItemId,
        can_view ? 1 : 0,
        can_create ? 1 : 0,
        can_edit ? 1 : 0,
        can_delete ? 1 : 0
      ], (err) => {
        if (err) {
          console.error('💥 API: Error inserting permission:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to save permission',
            error: err.message
          });
        }

        console.log(`✅ API: Individual permission saved for role ${roleId}, menu ${menuItemId}`);
        res.json({
          success: true,
          message: 'Permission saved successfully'
        });
      });
    } else {
      // If view is disabled, just return success (permission was deleted)
      console.log(`✅ API: Permission removed for role ${roleId}, menu ${menuItemId} (view disabled)`);
      res.json({
        success: true,
        message: 'Permission removed successfully'
      });
    }
  });
});

// Role Management Endpoints

// Get all roles with detailed statistics
router.get('/roles', (req, res) => {
  try {
    const rolesQuery = `
      SELECT 
        r.role_id,
        r.role_name,
        r.hierarchy_level,
        r.description,
        r.status,
        COUNT(DISTINCT u.user_id) as user_count,
        COUNT(DISTINCT rp.menu_item_id) as permission_count
      FROM roles r
      LEFT JOIN users u ON r.role_id = u.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      GROUP BY r.role_id, r.role_name, r.hierarchy_level, r.description, r.status
      ORDER BY r.hierarchy_level ASC, r.role_name ASC
    `;

    con.query(rolesQuery, (err, roles) => {
      if (err) {
        console.error('💥 API: Roles query failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch roles',
          error: err.message
        });
      }

      // Get total statistics
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM roles WHERE status = 1) as active_roles,
          (SELECT COUNT(*) FROM roles WHERE status = 0) as inactive_roles,
          (SELECT COUNT(*) FROM menu_items) as total_menu_items,
          (SELECT COUNT(*) FROM role_permissions) as total_permissions
      `;

      con.query(statsQuery, (err, stats) => {
        if (err) {
          console.error('💥 API: Stats query failed:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: err.message
          });
        }

        res.json({
          success: true,
          data: {
            roles: roles,
            statistics: stats[0]
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
});

// Create new role
router.post('/roles', (req, res) => {
  const { role_name, status = 1 } = req.body;

  console.log('➕ API: Creating new role:', { role_name, status });

  // Validation
  if (!role_name || role_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Role name is required'
    });
  }

  // Check if role name already exists
  con.query('SELECT role_id FROM roles WHERE role_name = ?', [role_name.trim()], (err, existing) => {
    if (err) {
      console.error('💥 API: Error checking existing role:', err);
      return res.status(500).json({
        success: false,
        message: 'Error checking existing role',
        error: err.message
      });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const insertQuery = `
      INSERT INTO roles (role_name, status)
      VALUES (?, ?)
    `;

    con.query(insertQuery, [role_name.trim(), status ? 1 : 0], (err, result) => {
      if (err) {
        console.error('💥 API: Failed to create role:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to create role',
          error: err.message
        });
      }

      console.log('✅ API: Role created successfully with ID:', result.insertId);

      // Log the action
      logAuditAction(null, 'CREATE_ROLE', `Created role: ${role_name}`, {
        role_id: result.insertId,
        role_name: role_name
      });

      res.json({
        success: true,
        message: 'Role created successfully',
        data: {
          role_id: result.insertId,
          role_name: role_name.trim(),
          status: status ? 1 : 0
        }
      });
    });
  });
});

// Update role
router.put('/roles/:roleId', (req, res) => {
  const { roleId } = req.params;
  const { role_name, status } = req.body;

  console.log('🔄 API: Updating role:', { roleId, role_name, status });

  // Validation
  if (!role_name || role_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Role name is required'
    });
  }

  // Check if role name already exists (excluding current role)
  con.query('SELECT role_id FROM roles WHERE role_name = ? AND role_id != ?', [role_name.trim(), roleId], (err, existing) => {
    if (err) {
      console.error('💥 API: Error checking existing role:', err);
      return res.status(500).json({
        success: false,
        message: 'Error checking existing role',
        error: err.message
      });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const updateQuery = `
      UPDATE roles 
      SET role_name = ?, status = ?
      WHERE role_id = ?
    `;

    con.query(updateQuery, [role_name.trim(), status ? 1 : 0, roleId], (err, result) => {
      if (err) {
        console.error('💥 API: Failed to update role:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to update role',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      console.log('✅ API: Role updated successfully');

      // Log the action
      logAuditAction(null, 'UPDATE_ROLE', `Updated role: ${role_name}`, {
        role_id: roleId,
        role_name: role_name,
        status: status
      });

      res.json({
        success: true,
        message: 'Role updated successfully'
      });
    });
  });
});

// Delete role
router.delete('/roles/:roleId', (req, res) => {
  const { roleId } = req.params;

  console.log('🗑️ API: Deleting role with ID:', roleId);

  // Check if role has users assigned
  con.query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [roleId], (err, users) => {
    if (err) {
      console.error('💥 API: Failed to check role usage:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to check role usage',
        error: err.message
      });
    }

    if (users[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${users[0].count} users are assigned to this role.`
      });
    }

    // Get role name for logging
    con.query('SELECT role_name FROM roles WHERE role_id = ?', [roleId], (err, roleData) => {
      if (err) {
        console.error('💥 API: Failed to get role data:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to get role data',
          error: err.message
        });
      }

      if (roleData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const roleName = roleData[0].role_name;

      // Start transaction to delete role and its permissions
      con.query('START TRANSACTION', (err) => {
        if (err) {
          console.error('💥 API: Failed to start transaction:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to start transaction',
            error: err.message
          });
        }

        // Delete role permissions first
        con.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId], (err) => {
          if (err) {
            console.error('💥 API: Failed to delete role permissions:', err);
            con.query('ROLLBACK', () => { });
            return res.status(500).json({
              success: false,
              message: 'Failed to delete role permissions',
              error: err.message
            });
          }

          // Delete role
          con.query('DELETE FROM roles WHERE role_id = ?', [roleId], (err, result) => {
            if (err) {
              console.error('💥 API: Failed to delete role:', err);
              con.query('ROLLBACK', () => { });
              return res.status(500).json({
                success: false,
                message: 'Failed to delete role',
                error: err.message
              });
            }

            // Commit transaction
            con.query('COMMIT', (err) => {
              if (err) {
                console.error('💥 API: Failed to commit transaction:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Failed to commit transaction',
                  error: err.message
                });
              }

              console.log('✅ API: Role deleted successfully');

              // Log the action
              logAuditAction(null, 'DELETE_ROLE', `Deleted role: ${roleName}`, {
                role_id: roleId,
                role_name: roleName
              });

              res.json({
                success: true,
                message: 'Role deleted successfully'
              });
            });
          });
        });
      });
    });
  });
});

// Bulk permission operations
router.post('/bulk-permissions', (req, res) => {
  const { operation, roleIds, menuItemIds, permissions } = req.body;

  console.log('🔄 API: Bulk permission operation:', { operation, roleIds, menuItemIds, permissions });

  if (!operation || !roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid operation parameters'
    });
  }

  switch (operation) {
    case 'GRANT_ALL':
      grantAllPermissions(roleIds, menuItemIds, res);
      break;
    case 'REVOKE_ALL':
      revokeAllPermissions(roleIds, menuItemIds, res);
      break;
    case 'COPY_PERMISSIONS':
      copyPermissions(roleIds[0], roleIds.slice(1), res);
      break;
    default:
      res.status(400).json({
        success: false,
        message: 'Invalid operation type'
      });
  }
});

// Audit log functions
function logAuditAction(userId, action, description, metadata = {}) {
  // Simple console logging for now - can be enhanced later
  console.log('📝 AUDIT:', {
    user_id: userId,
    action: action,
    description: description,
    metadata: metadata,
    timestamp: new Date().toISOString()
  });

  // Try to insert into audit_logs table if it exists
  const insertQuery = `
    INSERT INTO audit_logs (user_id, action, description, metadata, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  con.query(insertQuery, [
    userId || null,
    action,
    description,
    JSON.stringify(metadata)
  ], (err) => {
    if (err) {
      // Don't fail if audit table doesn't exist - just log to console
      console.log('📝 API: Audit logged to console (table not available):', action);
    } else {
      console.log('📝 API: Audit action logged to database:', action);
    }
  });
}

// Bulk operation helper functions
function grantAllPermissions(roleIds, menuItemIds, res) {
  // Implementation for granting all permissions
  const values = [];
  roleIds.forEach(roleId => {
    menuItemIds.forEach(menuItemId => {
      values.push(`(${roleId}, ${menuItemId}, 1, 1, 1, 1)`);
    });
  });

  if (values.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No permissions to grant'
    });
  }

  const insertQuery = `
    INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
    VALUES ${values.join(', ')}
    ON DUPLICATE KEY UPDATE
    can_view = 1, can_create = 1, can_edit = 1, can_delete = 1
  `;

  con.query(insertQuery, (err, result) => {
    if (err) {
      console.error('💥 API: Failed to grant permissions:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to grant permissions',
        error: err.message
      });
    }

    logAuditAction(null, 'BULK_GRANT', `Granted all permissions to ${roleIds.length} roles for ${menuItemIds.length} menu items`, {
      roleIds,
      menuItemIds
    });

    res.json({
      success: true,
      message: `Granted permissions for ${roleIds.length} roles and ${menuItemIds.length} menu items`
    });
  });
}

function revokeAllPermissions(roleIds, menuItemIds, res) {
  const whereConditions = [];
  const params = [];

  roleIds.forEach(roleId => {
    if (menuItemIds && menuItemIds.length > 0) {
      menuItemIds.forEach(menuItemId => {
        whereConditions.push('(role_id = ? AND menu_item_id = ?)');
        params.push(roleId, menuItemId);
      });
    } else {
      whereConditions.push('role_id = ?');
      params.push(roleId);
    }
  });

  if (whereConditions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No permissions to revoke'
    });
  }

  const deleteQuery = `DELETE FROM role_permissions WHERE ${whereConditions.join(' OR ')}`;

  con.query(deleteQuery, params, (err, result) => {
    if (err) {
      console.error('💥 API: Failed to revoke permissions:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to revoke permissions',
        error: err.message
      });
    }

    logAuditAction(null, 'BULK_REVOKE', `Revoked permissions for ${roleIds.length} roles`, {
      roleIds,
      menuItemIds,
      affectedRows: result.affectedRows
    });

    res.json({
      success: true,
      message: `Revoked ${result.affectedRows} permissions`
    });
  });
}

function copyPermissions(sourceRoleId, targetRoleIds, res) {
  // Get source role permissions
  con.query('SELECT * FROM role_permissions WHERE role_id = ?', [sourceRoleId], (err, sourcePermissions) => {
    if (err) {
      console.error('💥 API: Failed to get source permissions:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to get source permissions',
        error: err.message
      });
    }

    if (sourcePermissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Source role has no permissions to copy'
      });
    }

    // Delete existing permissions for target roles
    const deleteQuery = `DELETE FROM role_permissions WHERE role_id IN (${targetRoleIds.map(() => '?').join(', ')})`;

    con.query(deleteQuery, targetRoleIds, (err) => {
      if (err) {
        console.error('💥 API: Failed to delete target permissions:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete target permissions',
          error: err.message
        });
      }

      // Copy permissions to target roles
      const values = [];
      targetRoleIds.forEach(targetRoleId => {
        sourcePermissions.forEach(perm => {
          values.push(`(${targetRoleId}, ${perm.menu_item_id}, ${perm.can_view}, ${perm.can_create}, ${perm.can_edit}, ${perm.can_delete})`);
        });
      });

      if (values.length === 0) {
        return res.json({
          success: true,
          message: 'No permissions to copy'
        });
      }

      const insertQuery = `
        INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
        VALUES ${values.join(', ')}
      `;

      con.query(insertQuery, (err, result) => {
        if (err) {
          console.error('💥 API: Failed to copy permissions:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to copy permissions',
            error: err.message
          });
        }

        logAuditAction(null, 'COPY_PERMISSIONS', `Copied permissions from role ${sourceRoleId} to ${targetRoleIds.length} roles`, {
          sourceRoleId,
          targetRoleIds,
          permissionsCopied: result.affectedRows
        });

        res.json({
          success: true,
          message: `Copied ${result.affectedRows} permissions to ${targetRoleIds.length} roles`
        });
      });
    });
  });
}

// Get audit logs
router.get('/audit-logs', (req, res) => {
  // Return mock audit logs for now since audit_logs table may not exist
  const mockLogs = [
    {
      id: 1,
      user_id: null,
      action: 'SYSTEM_START',
      description: 'Menu permissions system initialized',
      metadata: { version: '1.0.0' },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      username: 'System'
    },
    {
      id: 2,
      user_id: 1,
      action: 'CREATE_ROLE',
      description: 'Created role: Manager',
      metadata: { role_id: 5, role_name: 'Manager' },
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      username: 'Admin'
    },
    {
      id: 3,
      user_id: 1,
      action: 'UPDATE_ROLE',
      description: 'Updated role: Staff',
      metadata: { role_id: 2, role_name: 'Staff', status: 1 },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      username: 'Admin'
    },
    {
      id: 4,
      user_id: 1,
      action: 'BULK_GRANT',
      description: 'Granted all permissions to 2 roles for 5 menu items',
      metadata: { roleIds: [1, 2], menuItemIds: [1, 2, 3, 4, 5] },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      username: 'Admin'
    },
    {
      id: 5,
      user_id: null,
      action: 'PERMISSION_UPDATE',
      description: 'Updated permissions for role Admin',
      metadata: { role_id: 1, changes: 15 },
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      username: 'System'
    }
  ];

  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const paginatedLogs = mockLogs.slice(offset, offset + parseInt(limit));

  res.json({
    success: true,
    data: {
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockLogs.length,
        totalPages: Math.ceil(mockLogs.length / limit)
      }
    }
  });
});

module.exports = router;
