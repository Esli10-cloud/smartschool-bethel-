import { supabase } from "../lib/supabase";

export async function getStudents() {
  return await supabase
    .from("students")
    .select("*")
    .order("nom");
}

export async function addStudent(student) {
  return await supabase
    .from("students")
    .insert([student]);
}

export async function deleteStudent(id) {
  return await supabase
    .from("students")
    .delete()
    .eq("id", id);
}