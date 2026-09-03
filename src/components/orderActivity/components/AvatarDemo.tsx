import React from 'react';
import { UserAvatar } from './UserAvatar';

/**
 * AvatarDemo Component
 * 
 * Showcases the UserAvatar component with various configurations:
 * - With profile pictures
 * - Without profile pictures (showing initials)
 * - Different sizes
 * - Various name formats
 */
export const AvatarDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Avatar Component</h2>
        <p className="text-gray-600">
          Demonstrates avatar behavior with and without profile pictures
        </p>
      </div>

      {/* With Profile Pictures */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">With Profile Pictures</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <UserAvatar 
              name="Admin User" 
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              size="md"
            />
            <span className="text-xs text-gray-600">Admin User</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar 
              name="Sarah Johnson" 
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
              size="md"
            />
            <span className="text-xs text-gray-600">Sarah Johnson</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar 
              name="Michael Chen" 
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=michael"
              size="md"
            />
            <span className="text-xs text-gray-600">Michael Chen</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar 
              name="Emily Davis" 
              imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=emily"
              size="md"
            />
            <span className="text-xs text-gray-600">Emily Davis</span>
          </div>
        </div>
      </div>

      {/* Without Profile Pictures (Initials) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Without Profile Pictures (Initials)</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Alice Adams" size="md" />
            <span className="text-xs text-gray-600">Alice Adams (AA)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="George Harris" size="md" />
            <span className="text-xs text-gray-600">George Harris (GH)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Dustin Long" size="md" />
            <span className="text-xs text-gray-600">Dustin Long (DL)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Mayank Gupta" size="md" />
            <span className="text-xs text-gray-600">Mayank Gupta (MG)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Jennifer Martinez" size="md" />
            <span className="text-xs text-gray-600">Jennifer Martinez (JM)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Robert Kim" size="md" />
            <span className="text-xs text-gray-600">Robert Kim (RK)</span>
          </div>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Different Sizes</h3>
        <div className="flex flex-wrap items-end gap-8">
          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Alice Adams" size="xs" />
            <span className="text-xs text-gray-600">XS (24px)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Alice Adams" size="sm" />
            <span className="text-xs text-gray-600">SM (32px)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Alice Adams" size="md" />
            <span className="text-xs text-gray-600">MD (40px)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Alice Adams" size="lg" />
            <span className="text-xs text-gray-600">LG (48px)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Alice Adams" size="xl" />
            <span className="text-xs text-gray-600">XL (64px)</span>
          </div>
        </div>
      </div>

      {/* User List Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">User List Example</h3>
        <div className="space-y-3">
          {[
            { name: "Alice Adams", role: "Order Manager", status: "online" },
            { name: "George Harris", role: "Technical Lead", status: "online" },
            { name: "Dustin Long", role: "Field Technician", status: "busy" },
            { name: "Mayank Gupta", role: "Support Engineer", status: "away" },
            { name: "Jennifer Martinez", role: "Operations Lead", status: "offline" },
          ].map((user) => (
            <div key={user.name} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
              <UserAvatar name={user.name} size="md" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">{user.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  user.status === 'online' ? 'bg-green-500' :
                  user.status === 'busy' ? 'bg-red-500' :
                  user.status === 'away' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}></span>
                <span className="text-sm text-gray-600 capitalize">{user.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge Cases */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Edge Cases</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="Madonna" size="md" />
            <span className="text-xs text-gray-600">Single Name (MA)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="John Jacob Jingleheimer Schmidt" size="md" />
            <span className="text-xs text-gray-600">Long Name (JS)</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="李明" size="md" />
            <span className="text-xs text-gray-600">Chinese Name</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <UserAvatar name="José García" size="md" />
            <span className="text-xs text-gray-600">Accented Name</span>
          </div>
        </div>
      </div>

      {/* Mixed Profile Pictures and Initials */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Mixed: Pictures + Initials</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Sarah Johnson", hasImage: true },
            { name: "Alice Adams", hasImage: false },
            { name: "Michael Chen", hasImage: true },
            { name: "George Harris", hasImage: false },
            { name: "Emily Davis", hasImage: true },
            { name: "Dustin Long", hasImage: false },
            { name: "Admin User", hasImage: true },
            { name: "Mayank Gupta", hasImage: false },
          ].map((user) => (
            <div key={user.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <UserAvatar 
                name={user.name}
                imageUrl={user.hasImage ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.toLowerCase().replace(/\s+/g, '')}` : undefined}
                size="sm"
              />
              <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
