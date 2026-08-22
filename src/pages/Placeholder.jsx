import AppLayout from '../components/AppLayout';

export default function Placeholder({ pageName }) {
  return (
    <AppLayout title={pageName}>
      <div className="bg-[#131A2A] p-8 rounded-lg shadow text-center">
        <h2 className="text-xl font-medium text-gray-600">Coming soon</h2>
        <p className="mt-2 text-gray-500">This page is under construction by another team member.</p>
      </div>
    </AppLayout>
  );
}




