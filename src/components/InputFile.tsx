type FileType = "image" | "video" | "other";

interface LoadedFile {
  type: FileType;
  src: string;
  file: File;
}

interface InputFileBase {
  allow?: FileType[];
}

interface InputFileSingle extends InputFileBase {
  multiple?: false;
  onLoaded: (data: LoadedFile) => void;
}

interface InputFileMultiple extends InputFileBase {
  multiple: true;
  onLoaded: (data: LoadedFile[]) => void;
}

type InputFileProps = InputFileSingle | InputFileMultiple;

const acceptMap: Record<FileType, string> = {
  image: "image/*",
  video: "video/*",
  other: "*/*",
};

const getFileType = (file: File): FileType => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "other";
};

const processFile = (file: File): Promise<LoadedFile> => {
  return new Promise((resolve) => {
    const type = getFileType(file);

    if (type === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({ type, src: e.target?.result as string, file });
      };
      reader.readAsDataURL(file);
    } else {
      resolve({ type, src: URL.createObjectURL(file), file });
    }
  });
};

const InputFile = ({ allow, multiple = false, onLoaded }: InputFileProps) => {
  const accept = allow
    ? allow
        .filter((t) => t !== "other")
        .map((t) => acceptMap[t])
        .join(",")
    : "*/*";

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const filtered = files.filter((file) => {
      const type = getFileType(file);
      if (allow && !allow.includes(type)) return false;
      return true;
    });

    const results = await Promise.all(filtered.map(processFile));

    if (multiple) {
      (onLoaded as (data: LoadedFile[]) => void)(results);
    } else {
      (onLoaded as (data: LoadedFile) => void)(results[0]);
    }
  };

  return (
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={handleChange}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
      }}
    />
  );
};

export default InputFile;
export type { LoadedFile };
