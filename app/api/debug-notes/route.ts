import { NextResponse } from "next/server";
import { getNotes, getUserByEmail } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await requireAuth();
        const user = await getUserByEmail(session.user.email);
        const notes = await getNotes();

        const diagnostics = notes.map(note => {
            const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
            const studentBranch = normalize(user?.branch || "");

            const branchMatch = !note.branches || note.branches.length === 0 ||
                note.branches.some((b: string) => {
                    const nb = normalize(b);
                    return nb === studentBranch || nb.includes(studentBranch) || studentBranch.includes(nb);
                });

            const semesterMatch = !note.semesters || note.semesters.length === 0 ||
                (user?.semester !== undefined && note.semesters.some((s: number) => Number(s) === Number(user?.semester)));

            const yearMatch = !note.year_of_study || Number(note.year_of_study) === Number(user?.year_of_study);

            return {
                title: note.title,
                isMatch: branchMatch && semesterMatch && yearMatch,
                checks: { branchMatch, semesterMatch, yearMatch },
                noteData: { branches: note.branches, semesters: note.semesters, year: note.year_of_study },
                userData: { branch: user?.branch, semester: user?.semester, year: user?.year_of_study },
                normalized: { studentBranch, noteBranches: note.branches?.map(normalize) }
            };
        });

        return NextResponse.json({ diagnostics });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
