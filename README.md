# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


npm run dev

Then open http://localhost:5173 and log in with any of these test accounts:

┌────────────────────┬──────────┬────────────────────────────────────────┐                                                                                                                                                                                                                                       
│       Email        │ Password │                  Role                  │                                                                                                                                                                                                                                       
├────────────────────┼──────────┼────────────────────────────────────────┤                                                                                                                                                                                                                                       
│ board@test.com     │ password │ Board Admin (sees all 9 board screens) │
├────────────────────┼──────────┼────────────────────────────────────────┤
│ treasurer@test.com │ password │ Treasurer (sees all 9 board screens)   │                                                                                                                                                                                                                                       
├────────────────────┼──────────┼────────────────────────────────────────┤
│ resident@test.com  │ password │ Resident (sees resident portal)        │                                                                                                                                                                                                                                       
└────────────────────┴──────────┴────────────────────────────────────────┘    

/onboarding is now the entry point for new users — no auth required, publicly accessible  


Test Login Accounts

┌────────────────────┬──────────┬──────────────┬────────────────────────────────┐                                                                                                                                                                                                                                
│       Email        │ Password │     Role     │             State              │                                                                                                                                                                                                                                
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ board@test.com     │ password │ board_admin  │ Approved, onboarding complete  │                                                                                                                                                                                                                                
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ pending@test.com   │ password │ board_admin  │ Awaiting super_admin review    │                                                                                                                                                                                                                                
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ rejected@test.com  │ password │ board_admin  │ Application rejected           │                                                                                                                                                                                                                                
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ new@test.com       │ password │ board_admin  │ Onboarding incomplete (step 2) │                                                                                                                                                                                                                              
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ treasurer@test.com │ password │ treasurer    │ Oakwood HOA                    │                                                                                                                                                                                                                              
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ member@test.com    │ password │ board_member │ Oakwood HOA                    │                                                                                                                                                                                                                              
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ resident@test.com  │ password │ resident     │ Unit 4B, Oakwood HOA           │                                                                                                                                                                                                                              
├────────────────────┼──────────┼──────────────┼────────────────────────────────┤                                                                                                                                                                                                                                
│ admin@test.com     │ password │ super_admin  │ —                              │                                                                                                                                                                                                                              
└────────────────────┴──────────┴──────────────┴────────────────────────────────┘
                                                                                                                                                                                                                                                                                                                 
---                                                                                                                                                                                                                                                                                                              
Mock Organizations

┌──────┬───────────────┬─────────────────────────────────┐
│  ID  │     Name      │             Status              │                                                                                                                                                                                                                                                       
├──────┼───────────────┼─────────────────────────────────┤                                                                                                                                                                                                                                                     
│ org1 │ Oakwood HOA   │ Approved, starter plan          │                                                                                                                                                                                                                                                       
├──────┼───────────────┼─────────────────────────────────┤                                                                                                                                                                                                                                                     
│ org2 │ Maplewood HOA │ Pending approval                │                                                                                                                                                                                                                                                       
├──────┼───────────────┼─────────────────────────────────┤                                                                                                                                                                                                                                                       
│ org3 │ Pinecrest HOA │ Rejected                        │                                                                                                                                                                                                                                                       
├──────┼───────────────┼─────────────────────────────────┤                                                                                                                                                                                                                                                       
│ org4 │ Riverside HOA │ Onboarding in progress (step 2) │                                                                                                                                                                                                                                                     
└──────┴───────────────┴─────────────────────────────────┘
                                                                                                                                                                                                                                                                                                                 
---                                                                                                                                                                                                                                                                                                              
Other Mock Data

- Residents — 4 residents (Carol, Dan, Eve, Frank) across Units 4B, 2A, 6C, 1D
- Dues — 4 records: 1 paid, 1 pending ×2, 1 overdue
- Maintenance requests — 3 (open, in_progress, resolved)
- Announcements — 2 (pool closure, annual meeting)
- Documents — 3 (bylaws PDF, rules PDF, budget XLSX)
- Invite tokens — resident-token-abc123 (for /accept) and board-token-xyz789 (for /invite)  
  http://localhost:5173/accept?token=resident-token-abc123

  This simulates a resident clicking their invite email link. It will:
    - Show the accept invite page for newresident@test.com in Unit 3C at Oakwood HOA
    - Let them set a password and activate their account     