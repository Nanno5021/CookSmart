import React from 'react';
import { BookOpen } from 'lucide-react';

function ManageRecipePage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Recipes</h2>
      <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
        <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400">Recipe management module coming soon...</p>
      </div>
    </div>
  );
}
export default ManageRecipePage;