//! Emits one learner's quilt patch as SVG on stdout.
//!
//!     quilt <username>
//!
//! Deterministic: the same username always produces the same patch, so a
//! re-run never changes someone's square, and nobody gets to pick theirs.

use std::process::ExitCode;

use dicebear_core::{Avatar, Style};
use serde_json::json;

fn main() -> ExitCode {
    let Some(username) = std::env::args().nth(1) else {
        eprintln!("usage: quilt <username>");
        return ExitCode::FAILURE;
    };

    let username = username.trim().to_lowercase();
    if username.is_empty() {
        eprintln!("error: empty username");
        return ExitCode::FAILURE;
    }

    let style = match Style::from_str(dicebear_styles::PATCHWORK) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("error: could not load the patchwork style: {e}");
            return ExitCode::FAILURE;
        }
    };

    let avatar = match Avatar::new(&style, json!({ "seed": username, "size": 160 })) {
        Ok(a) => a,
        Err(e) => {
            eprintln!("error: could not generate a patch for {username}: {e}");
            return ExitCode::FAILURE;
        }
    };

    println!("{}", avatar.to_svg());
    ExitCode::SUCCESS
}
