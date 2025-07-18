import { useState } from 'react';
import { 
  FiMail, 
  FiPhone, 
  FiLinkedin, 
  FiTwitter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiUser
} from 'react-icons/fi';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  department?: string;
  image_url?: string;
  is_active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isLoading?: boolean;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError || !member.image_url) {
      return null;
    }
    
    // Handle both relative and absolute URLs
    if (member.image_url.startsWith('http')) {
      return member.image_url;
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${member.image_url}`;
  };

  const imageSrc = getImageSrc();

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${!member.is_active ? 'opacity-60' : ''}`}>
      {/* Status Badge */}
      {!member.is_active && (
        <div className="absolute top-4 left-4 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full z-10">
          Inactive
        </div>
      )}

      {/* Header with Image */}
      <div className="relative p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-100">
          {imageSrc ? (
            <img 
              src={imageSrc}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiUser size={32} />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {member.name}
        </h3>
        <p className="text-blue-600 font-medium mb-2">
          {member.position}
        </p>
        
        {member.department && (
          <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
            {member.department}
          </span>
        )}
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {member.bio}
          </p>
        </div>
      )}

      {/* Contact Information */}
      <div className="px-6 pb-4 space-y-2">
        {member.email && (
          <div className="flex items-center text-sm text-gray-600">
            <FiMail className="mr-2 text-gray-400" size={14} />
            <a 
              href={`mailto:${member.email}`}
              className="hover:text-blue-600 transition-colors truncate"
            >
              {member.email}
            </a>
          </div>
        )}
        
        {member.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="mr-2 text-gray-400" size={14} />
            <a 
              href={`tel:${member.phone}`}
              className="hover:text-blue-600 transition-colors"
            >
              {member.phone}
            </a>
          </div>
        )}
      </div>

      {/* Social Links */}
      {(member.linkedin_url || member.twitter_url) && (
        <div className="px-6 pb-4">
          <div className="flex justify-center space-x-3">
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
              >
                <FiLinkedin size={16} />
              </a>
            )}
            
            {member.twitter_url && (
              <a
                href={member.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 transition-colors"
              >
                <FiTwitter size={16} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 pb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(member)}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiEdit size={14} />
            Edit
          </button>
          
          <button
            onClick={() => onToggleStatus(member.id)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center ${
              member.is_active 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={member.is_active ? 'Deactivate' : 'Activate'}
          >
            {member.is_active ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
          
          <button
            onClick={() => onDelete(member.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Order Position */}
      <div className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
        #{member.order_position}
      </div>
    </div>
  );
};

export default TeamMemberCard;
