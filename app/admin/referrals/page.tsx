import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/admin/auth";
import { listReferralCodes, listReferralPartners } from "@/lib/orders/service";
import {
  createReferralCodeAction,
  createReferralPartnerAction,
  updateReferralCodeAction,
} from "../actions";
import { AdminShell } from "../AdminShell";

export const metadata: Metadata = {
  title: "Admin Referral Codes",
};

export default async function AdminReferralsPage() {
  await requireAdmin();
  const [codes, partners] = await Promise.all([
    listReferralCodes(),
    listReferralPartners(),
  ]);
  const activeCodes = codes.filter((code) => code.active);
  const activePartners = partners.filter((partner) => partner.active);
  const totalUses = codes.reduce((sum, code) => sum + code.usedCount, 0);

  return (
    <AdminShell>
      <div className="admin-stats">
        <Stat label="Codes" value={codes.length} />
        <Stat label="Active" value={activeCodes.length} />
        <Stat label="Partners" value={partners.length} />
        <Stat label="Total uses" value={totalUses} />
      </div>

      <div className="admin-form-grid">
        <form className="field-card" action={createReferralPartnerAction}>
          <h3>Add referral partner</h3>
          <p className="hint">
            Create the partner profile first, then attach one or more codes.
          </p>
          <div className="field-grid">
            <div className="field">
              <label>Name *</label>
              <input name="name" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" />
            </div>
            <div className="field full">
              <label>Notes</label>
              <textarea name="notes" rows={3} />
            </div>
            <label className="form-check full">
              <input name="active" type="checkbox" defaultChecked />
              Active partner
            </label>
          </div>
          <button type="submit" className="card-cta card-cta-buy">
            Add partner
          </button>
        </form>

        <form className="field-card" action={createReferralCodeAction}>
          <h3>Add referral code</h3>
          <p className="hint">
            Codes are normalized to uppercase and can be limited by minimum
            subtotal.
          </p>
          <div className="field-grid">
            <div className="field full">
              <label>Partner *</label>
              <select name="partnerId" required defaultValue="">
                <option value="" disabled>
                  Select partner
                </option>
                {activePartners.map((partner) => (
                  <option value={partner.id} key={partner.id}>
                    {partner.name}
                    {partner.email ? ` - ${partner.email}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Code *</label>
              <input name="code" required placeholder="LAB10" />
            </div>
            <div className="field">
              <label>Discount type</label>
              <select name="discountType" defaultValue="percent">
                <option value="percent">Percent</option>
                <option value="fixed">Fixed dollars</option>
              </select>
            </div>
            <div className="field">
              <label>Discount value *</label>
              <input
                name="discountValue"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="10"
              />
            </div>
            <div className="field">
              <label>Minimum subtotal</label>
              <input
                name="minSubtotalDollars"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <label className="form-check">
              <input name="active" type="checkbox" defaultChecked />
              Active code
            </label>
            <label className="form-check">
              <input
                name="allowReconstitutionSolution"
                type="checkbox"
                defaultChecked
              />
              Reconstitution solution
            </label>
          </div>
          <button
            type="submit"
            className="card-cta card-cta-buy"
            disabled={activePartners.length === 0}
          >
            Add code
          </button>
        </form>
      </div>

      <div className="admin-list">
        {codes.length === 0 ? (
          <div className="field-card">
            <h3>No referral codes yet</h3>
            <p className="hint">
              Referral partners and codes will appear here after they are added
              to the database.
            </p>
          </div>
        ) : (
          codes.map((code) => (
            <form
              className="admin-card referral-row"
              action={updateReferralCodeAction}
              key={code.id}
            >
              <input type="hidden" name="referralCodeId" value={code.id} />

              <div>
                <span className="admin-label">Code</span>
                <h3>{code.code}</h3>
                <small>Created {new Date(code.createdAt).toLocaleDateString()}</small>
              </div>

              <div>
                <span className="admin-label">Partner</span>
                <p>{code.partnerName}</p>
                <small>{code.partnerEmail || "No email"}</small>
              </div>

              <div>
                <span className="admin-label">Discount</span>
                <p>{formatDiscount(code.discountType, code.discountValue)}</p>
                <small>Min {formatPrice(code.minSubtotalCents)}</small>
              </div>

              <div>
                <span className="admin-label">Used</span>
                <p>{code.usedCount}</p>
              </div>

              <label className="check-row">
                <input name="active" type="checkbox" defaultChecked={code.active} />
                Active
              </label>

              <label className="check-row">
                <input
                  name="allowReconstitutionSolution"
                  type="checkbox"
                  defaultChecked={code.allowReconstitutionSolution}
                />
                Reconstitution solution
              </label>

              <button type="submit" className="card-cta card-cta-buy">
                Save
              </button>
            </form>
          ))
        )}
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="value-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

function formatDiscount(type: "percent" | "fixed", value: number) {
  return type === "percent" ? `${value}%` : formatPrice(value);
}
