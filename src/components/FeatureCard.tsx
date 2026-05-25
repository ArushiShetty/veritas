
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  link,
  linkText,
}) => {
  return (
    <div className="card flex flex-col h-full group transform hover:-translate-y-1.5 hover:shadow-xl hover:border-veritas-purple/20 transition-all duration-300 shadow-purple-500/5 active:scale-[0.99] animate-fade-up bg-white">
      <div className="bg-veritas-lightPurple p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-100 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-veritas-purple transition-colors group-hover:text-purple-800">{title}</h3>
      <p className="text-gray-600 mb-4 flex-grow leading-relaxed text-sm font-medium">{description}</p>
      <Link
        to={link}
        className="mt-auto text-veritas-purple font-semibold hover:underline flex items-center gap-1 group-hover:gap-1.5 transition-all"
      >
        {linkText} <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
};

export default FeatureCard;
