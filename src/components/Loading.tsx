interface LoadingProps {
	message: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="flex items-center gap-3 text-gray-400">
				<div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent"></div>
				{message}
			</div>
		</div>
	);
};

export default Loading;